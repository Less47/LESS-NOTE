import type { ChangeEvent, DragEvent, MutableRefObject } from 'react'

import type {
  BoardState,
  CanvasPoint,
  DocumentCard,
  ImageCard,
  SidebarCreateToolKind,
  WorkspaceMutationOptions,
} from './core'
import {
  DOCUMENT_HEIGHT,
  DOCUMENT_WIDTH,
  GRID_SIZE,
  IMAGE_HEIGHT,
  IMAGE_WIDTH,
  TOOLBAR_CREATE_DRAG_DATA_TYPE,
  TOOLBAR_CREATE_DRAG_TEXT_PREFIX,
  createDefaultImageCrop,
  getImageDisplaySize,
  getNextZIndex,
  getSidebarCreateToolLabel,
  getSidebarCreateToolSize,
  readFileAsDataUrl,
  readImageDimensions,
} from './core'
import type { UnsupportedUploadWarning } from './documentFiles'
import {
  createDocumentUploadPayload,
  getUnsupportedUploadWarning,
  isSupportedDocumentFile,
} from './documentFiles'

type DragCreationPreview = {
  kind: SidebarCreateToolKind
  worldPoint: CanvasPoint
} | null

type ImportedBoardAsset = ImageCard | DocumentCard
type ImportedImageSource = {
  src: string
  title: string
}

type CreateAssetImportControllerArgs = {
  usesDarkItems: boolean
  draggedCreationTool: SidebarCreateToolKind | null
  toolbarDragImageRef: MutableRefObject<HTMLElement | null>
  setDraggedCreationTool: (tool: SidebarCreateToolKind | null) => void
  setDragCreationPreview: (preview: DragCreationPreview) => void
  setIsCanvasHot: (isHot: boolean) => void
  addSidebarCreateToolAt: (toolKind: SidebarCreateToolKind, point: CanvasPoint) => void
  screenToWorld: (clientX: number, clientY: number) => CanvasPoint
  getCurrentBoardState: () => BoardState
  getViewportCenterInWorld: () => CanvasPoint
  getPlacementPosition: (x: number, y: number) => CanvasPoint
  updateBoard: (
    recipe: (currentBoard: BoardState) => BoardState,
    options?: WorkspaceMutationOptions,
  ) => void
  setSelection: (cardIds: string[], activeId?: string | null) => void
  setStatusText: (text: string) => void
  setUnsupportedUploadWarning: (warning: UnsupportedUploadWarning | null) => void
  isSnapToGridEnabled: () => boolean
  getSidebarCreateToolFromDataTransfer: (
    dataTransfer: DataTransfer | null,
  ) => SidebarCreateToolKind | null
}

function createAssetImportController(args: CreateAssetImportControllerArgs) {
  const getImageTitleFromText = (value: string, fallback: string) => {
    const trimmedValue = value.trim()
    if (!trimmedValue || trimmedValue.startsWith('data:image/')) {
      return fallback
    }

    try {
      const normalizedValue = trimmedValue.startsWith('//') ? `https:${trimmedValue}` : trimmedValue
      const parsedUrl = new URL(normalizedValue)
      const lastPathSegment = decodeURIComponent(parsedUrl.pathname.split('/').at(-1) ?? '')
      const stem = lastPathSegment.replace(/\.[^.]+$/, '').trim()
      if (stem) {
        return stem
      }

      return parsedUrl.hostname.replace(/^www\./, '') || fallback
    } catch {
      return fallback
    }
  }

  const normalizeDroppedImageSource = (value: string) => {
    const trimmedValue = value.trim()
    if (!trimmedValue) {
      return null
    }

    if (trimmedValue.startsWith('//')) {
      return `https:${trimmedValue}`
    }

    return trimmedValue
  }

  const tryEmbedDroppedImageSource = async (src: string) => {
    if (src.startsWith('data:image/')) {
      return src
    }

    if (src.startsWith('blob:') || src.startsWith('file:')) {
      return src
    }

    try {
      const response = await fetch(src)
      if (!response.ok) {
        return src
      }

      const blob = await response.blob()
      if (!blob.type.startsWith('image/')) {
        return src
      }

      const fileName = getImageTitleFromText(src, 'image')
      return await readFileAsDataUrl(new File([blob], fileName, { type: blob.type }))
    } catch {
      return src
    }
  }

  const extractImageSourcesFromHtml = (html: string) => {
    if (!html.trim()) {
      return [] as ImportedImageSource[]
    }

    const document = new DOMParser().parseFromString(html, 'text/html')
    return Array.from(document.querySelectorAll('img'))
      .map((image, index) => {
        const src = normalizeDroppedImageSource(image.getAttribute('src') ?? '')
        if (!src) {
          return null
        }

        const preferredTitle =
          image.getAttribute('alt')?.trim() ||
          image.getAttribute('title')?.trim() ||
          getImageTitleFromText(src, `Image ${index + 1}`)

        return {
          src,
          title: preferredTitle,
        } satisfies ImportedImageSource
      })
      .filter((source): source is ImportedImageSource => source !== null)
  }

  const extractDroppedImageSources = (dataTransfer: DataTransfer) => {
    const sources = new Map<string, ImportedImageSource>()
    const addSource = (source: ImportedImageSource | null) => {
      if (!source) {
        return
      }

      if (!sources.has(source.src)) {
        sources.set(source.src, source)
      }
    }

    const downloadUrl = dataTransfer.getData('DownloadURL')
    if (downloadUrl) {
      const firstSeparator = downloadUrl.indexOf(':')
      const secondSeparator =
        firstSeparator === -1 ? -1 : downloadUrl.indexOf(':', firstSeparator + 1)
      if (firstSeparator !== -1 && secondSeparator !== -1) {
        const mimeType = downloadUrl.slice(0, firstSeparator).trim()
        const fileName = downloadUrl.slice(firstSeparator + 1, secondSeparator).trim()
        const url = normalizeDroppedImageSource(downloadUrl.slice(secondSeparator + 1))
        if (url && mimeType.startsWith('image/')) {
          addSource({
            src: url,
            title: fileName.replace(/\.[^.]+$/, '').trim() || getImageTitleFromText(url, 'Image'),
          })
        }
      }
    }

    for (const source of extractImageSourcesFromHtml(dataTransfer.getData('text/html'))) {
      addSource(source)
    }

    const uriList = dataTransfer.getData('text/uri-list')
    if (uriList) {
      for (const line of uriList.split(/\r?\n/)) {
        const normalizedSource = normalizeDroppedImageSource(line)
        if (!normalizedSource || normalizedSource.startsWith('#')) {
          continue
        }

        addSource({
          src: normalizedSource,
          title: getImageTitleFromText(normalizedSource, 'Image'),
        })
      }
    }

    const plainText = normalizeDroppedImageSource(dataTransfer.getData('text/plain'))
    if (plainText) {
      addSource({
        src: plainText,
        title: getImageTitleFromText(plainText, 'Image'),
      })
    }

    return Array.from(sources.values())
  }

  const getDroppedFiles = (dataTransfer: DataTransfer) => {
    const directFiles = Array.from(dataTransfer.files)
    if (directFiles.length) {
      return directFiles
    }

    return Array.from(dataTransfer.items)
      .map((item) => (item.kind === 'file' ? item.getAsFile() : null))
      .filter((file): file is File => file !== null)
  }

  const buildImportedCards = async (files: FileList | File[]) => {
    const sourceFiles = Array.from(files)
    const supportedFiles = sourceFiles.filter(
      (file) => file.type.startsWith('image/') || isSupportedDocumentFile(file),
    )
    const center = args.getViewportCenterInWorld()
    const currentBoard = args.getCurrentBoardState()
    const baseZIndex = getNextZIndex(currentBoard.cards)
    const imageStackOffset = args.isSnapToGridEnabled() ? GRID_SIZE : 34

    return Promise.all(
      supportedFiles.map(async (file, index): Promise<ImportedBoardAsset> => {
        if (file.type.startsWith('image/')) {
          const src = await readFileAsDataUrl(file)
          const dimensions = await readImageDimensions(src).catch(() => ({
            width: IMAGE_WIDTH,
            height: IMAGE_HEIGHT,
          }))
          const size = getImageDisplaySize(dimensions.width, dimensions.height)
          const position = args.getPlacementPosition(
            center.x - size.width / 2 + index * imageStackOffset,
            center.y - size.height / 2 + index * imageStackOffset,
          )

          return {
            id: crypto.randomUUID(),
            kind: 'image',
            title: file.name.replace(/\.[^.]+$/, '') || `Image ${index + 1}`,
            columnId: null,
            columnIndex: 0,
            src,
            caption: '',
            fit: 'cover',
            crop: createDefaultImageCrop(),
            x: position.x,
            y: position.y,
            width: size.width,
            height: size.height,
            zIndex: baseZIndex + index,
          }
        }

        const payload = await createDocumentUploadPayload(file)
        const position = args.getPlacementPosition(
          center.x - DOCUMENT_WIDTH / 2 + index * imageStackOffset,
          center.y - DOCUMENT_HEIGHT / 2 + index * imageStackOffset,
        )

        return {
          id: crypto.randomUUID(),
          kind: 'document',
          title: payload.fileName,
          columnId: null,
          columnIndex: 0,
          x: position.x,
          y: position.y,
          width: DOCUMENT_WIDTH,
          height: DOCUMENT_HEIGHT,
          zIndex: baseZIndex + index,
          ...payload,
        }
      }),
    )
  }

  const buildImportedImageCardsFromSources = async (imageSources: ImportedImageSource[]) => {
    const resolvedImages = await Promise.all(
      imageSources.map(async (imageSource) => {
        const resolvedSrc = await tryEmbedDroppedImageSource(imageSource.src)
        const dimensions = await readImageDimensions(resolvedSrc).catch(() => null)
        if (!dimensions) {
          return null
        }

        return {
          src: resolvedSrc,
          title: imageSource.title.trim() || getImageTitleFromText(resolvedSrc, 'Image'),
          width: dimensions.width,
          height: dimensions.height,
        }
      }),
    )

    const importedImages = resolvedImages.filter(
      (
        image,
      ): image is {
        src: string
        title: string
        width: number
        height: number
      } => image !== null,
    )

    const center = args.getViewportCenterInWorld()
    const currentBoard = args.getCurrentBoardState()
    const baseZIndex = getNextZIndex(currentBoard.cards)
    const imageStackOffset = args.isSnapToGridEnabled() ? GRID_SIZE : 34

    return importedImages.map((image, index): ImageCard => {
      const size = getImageDisplaySize(image.width, image.height)
      const position = args.getPlacementPosition(
        center.x - size.width / 2 + index * imageStackOffset,
        center.y - size.height / 2 + index * imageStackOffset,
      )

      return {
        id: crypto.randomUUID(),
        kind: 'image',
        title: image.title,
        columnId: null,
        columnIndex: 0,
        src: image.src,
        caption: '',
        fit: 'cover',
        crop: createDefaultImageCrop(),
        x: position.x,
        y: position.y,
        width: size.width,
        height: size.height,
        zIndex: baseZIndex + index,
      }
    })
  }

  const addFiles = async (files: FileList | File[]) => {
    const sourceFiles = Array.from(files)
    const unsupportedFiles = sourceFiles.filter(
      (file) => !file.type.startsWith('image/') && !isSupportedDocumentFile(file),
    )
    const importedCards = await buildImportedCards(sourceFiles)

    if (!importedCards.length) {
      if (unsupportedFiles[0]) {
        args.setUnsupportedUploadWarning(getUnsupportedUploadWarning(unsupportedFiles[0]))
        args.setStatusText('That file type is not supported.')
      } else {
        args.setStatusText('No files were added.')
      }
      return
    }

    args.updateBoard(
      (currentBoard) => ({
        ...currentBoard,
        cards: [...currentBoard.cards, ...importedCards],
      }),
      {
        recordUndo: true,
      },
    )

    args.setSelection(
      importedCards.map((card) => card.id),
      importedCards.at(-1)?.id ?? null,
    )

    if (unsupportedFiles[0]) {
      args.setUnsupportedUploadWarning(getUnsupportedUploadWarning(unsupportedFiles[0]))
    }

    const imageCount = importedCards.filter((card) => card.kind === 'image').length
    const documentCount = importedCards.length - imageCount
    let statusText = ''

    if (imageCount > 0 && documentCount > 0) {
      statusText = `${importedCards.length} files added to the board.`
    } else if (documentCount > 0) {
      statusText =
        documentCount === 1
          ? '1 document added to the board.'
          : `${documentCount} documents added to the board.`
    } else {
      statusText =
        imageCount === 1 ? '1 image added to the board.' : `${imageCount} images added to the board.`
    }

    if (unsupportedFiles.length) {
      statusText += ` ${unsupportedFiles.length} unsupported ${
        unsupportedFiles.length === 1 ? 'file was' : 'files were'
      } skipped.`
    }

    args.setStatusText(statusText)
  }

  const addDroppedImageSources = async (imageSources: ImportedImageSource[]) => {
    const importedCards = await buildImportedImageCardsFromSources(imageSources)
    const skippedCount = imageSources.length - importedCards.length

    if (!importedCards.length) {
      args.setStatusText('That drop did not contain an importable image.')
      return
    }

    args.updateBoard(
      (currentBoard) => ({
        ...currentBoard,
        cards: [...currentBoard.cards, ...importedCards],
      }),
      {
        recordUndo: true,
      },
    )

    args.setSelection(
      importedCards.map((card) => card.id),
      importedCards.at(-1)?.id ?? null,
    )

    let statusText =
      importedCards.length === 1
        ? '1 image added to the board.'
        : `${importedCards.length} images added to the board.`

    if (skippedCount > 0) {
      statusText += ` ${skippedCount} dropped ${skippedCount === 1 ? 'item was' : 'items were'} skipped.`
    }

    args.setStatusText(statusText)
  }

  const clearToolbarDragImage = () => {
    args.toolbarDragImageRef.current?.remove()
    args.toolbarDragImageRef.current = null
  }

  const createToolbarDragImage = (toolKind: SidebarCreateToolKind) => {
    clearToolbarDragImage()

    const toolSize = getSidebarCreateToolSize(toolKind)
    const maxPreviewWidth = 168
    const previewScale = Math.min(maxPreviewWidth / toolSize.width, 1)
    const previewWidth = Math.max(96, Math.round(toolSize.width * previewScale))
    const previewHeight = Math.max(56, Math.round(toolSize.height * previewScale))
    const previewLabel = getSidebarCreateToolLabel(toolKind)

    const preview = document.createElement('div')
    preview.setAttribute('aria-hidden', 'true')
    Object.assign(preview.style, {
      position: 'fixed',
      left: '-9999px',
      top: '-9999px',
      width: `${previewWidth}px`,
      height: `${previewHeight}px`,
      display: 'grid',
      placeItems: 'center',
      padding: '10px',
      border: `1px solid ${
        args.usesDarkItems ? 'rgba(245, 238, 228, 0.16)' : 'rgba(29, 45, 40, 0.12)'
      }`,
      background: args.usesDarkItems
        ? 'rgba(15, 17, 16, 0.96)'
        : 'rgba(255, 252, 247, 0.98)',
      color: args.usesDarkItems ? '#f5eee4' : '#1d2d28',
      boxShadow: args.usesDarkItems
        ? '0 16px 28px rgba(0, 0, 0, 0.28)'
        : '0 16px 28px rgba(24, 32, 29, 0.12)',
      pointerEvents: 'none',
      zIndex: '9999',
      boxSizing: 'border-box',
      fontFamily: 'inherit',
    } satisfies Partial<CSSStyleDeclaration>)

    const label = document.createElement('span')
    label.textContent = previewLabel
    Object.assign(label.style, {
      padding: '0.34rem 0.56rem',
      border: `1px solid ${
        args.usesDarkItems ? 'rgba(245, 238, 228, 0.12)' : 'rgba(29, 45, 40, 0.08)'
      }`,
      background: args.usesDarkItems
        ? 'rgba(245, 238, 228, 0.06)'
        : 'rgba(255, 255, 255, 0.82)',
      fontSize: '0.7rem',
      fontWeight: '700',
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      lineHeight: '1',
    } satisfies Partial<CSSStyleDeclaration>)

    preview.append(label)
    document.body.append(preview)
    args.toolbarDragImageRef.current = preview

    return {
      element: preview,
      offsetX: Math.round(previewWidth / 2),
      offsetY: Math.round(previewHeight / 2),
    }
  }

  const handleToolbarButtonDragStart = (
    event: DragEvent<HTMLButtonElement>,
    tool: { createKind?: SidebarCreateToolKind; disabled?: boolean },
  ) => {
    if (!tool.createKind || tool.disabled) {
      event.preventDefault()
      return
    }

    args.setDraggedCreationTool(tool.createKind)
    args.setDragCreationPreview(null)
    event.dataTransfer.effectAllowed = 'copy'
    event.dataTransfer.setData(TOOLBAR_CREATE_DRAG_DATA_TYPE, tool.createKind)
    event.dataTransfer.setData(
      'text/plain',
      `${TOOLBAR_CREATE_DRAG_TEXT_PREFIX}${tool.createKind}`,
    )

    const dragImage = createToolbarDragImage(tool.createKind)
    event.dataTransfer.setDragImage(dragImage.element, dragImage.offsetX, dragImage.offsetY)
  }

  const handleToolbarButtonDragEnd = () => {
    args.setDraggedCreationTool(null)
    args.setDragCreationPreview(null)
    args.setIsCanvasHot(false)
    clearToolbarDragImage()
  }

  const handleCanvasDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    args.setIsCanvasHot(false)
    const createTool =
      args.draggedCreationTool ?? args.getSidebarCreateToolFromDataTransfer(event.dataTransfer)
    args.setDragCreationPreview(null)

    if (createTool) {
      args.setDraggedCreationTool(null)
      args.addSidebarCreateToolAt(createTool, args.screenToWorld(event.clientX, event.clientY))
      return
    }

    const droppedFiles = getDroppedFiles(event.dataTransfer)
    if (droppedFiles.length) {
      await addFiles(droppedFiles)
      return
    }

    const droppedImageSources = extractDroppedImageSources(event.dataTransfer)
    if (droppedImageSources.length) {
      await addDroppedImageSources(droppedImageSources)
      return
    }

    args.setStatusText('That drop did not contain a supported file or image.')
  }

  const handleCanvasDragEnter = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    args.setIsCanvasHot(true)

    const createTool =
      args.draggedCreationTool ?? args.getSidebarCreateToolFromDataTransfer(event.dataTransfer)
    if (!createTool) {
      return
    }

    args.setDragCreationPreview({
      kind: createTool,
      worldPoint: args.screenToWorld(event.clientX, event.clientY),
    })
  }

  const handleCanvasDragLeave = (event: DragEvent<HTMLDivElement>) => {
    const nextTarget = event.relatedTarget
    if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) {
      return
    }

    args.setIsCanvasHot(false)
    args.setDragCreationPreview(null)
  }

  const handleCanvasDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    args.setIsCanvasHot(true)

    const createTool =
      args.draggedCreationTool ?? args.getSidebarCreateToolFromDataTransfer(event.dataTransfer)
    if (!createTool) {
      event.dataTransfer.dropEffect = 'copy'
      args.setDragCreationPreview(null)
      return
    }

    event.dataTransfer.dropEffect = 'copy'
    args.setDragCreationPreview({
      kind: createTool,
      worldPoint: args.screenToWorld(event.clientX, event.clientY),
    })
  }

  const handleImageInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    event.target.value = ''
    if (files) {
      void addFiles(files)
    }
  }

  const handleDocumentInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    event.target.value = ''
    if (files) {
      void addFiles(files)
    }
  }

  return {
    addFiles,
    clearToolbarDragImage,
    handleCanvasDragEnter,
    handleCanvasDragLeave,
    handleCanvasDragOver,
    handleCanvasDrop,
    handleDocumentInputChange,
    handleImageInputChange,
    handleToolbarButtonDragEnd,
    handleToolbarButtonDragStart,
  }
}

export { createAssetImportController }
