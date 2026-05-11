import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderBlockSection } from '../BlockSection.js'

describe('BlockSection', () => {
  let container

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('renders block section with title', () => {
    const props = {
      blockId: 'block-1',
      blockName: 'Unit 1: Fundamentos',
      isExpanded: true,
      childCount: 3,
      onToggle: vi.fn(),
    }

    renderBlockSection(container, props)

    expect(container.textContent).toContain('Unit 1: Fundamentos')
    expect(container.querySelector('.block-section')).toBeTruthy()
  })

  it('displays child count in header', () => {
    const props = {
      blockId: 'block-1',
      blockName: 'Unit 1',
      isExpanded: true,
      childCount: 5,
      onToggle: vi.fn(),
    }

    renderBlockSection(container, props)

    expect(container.textContent).toContain('5')
  })

  it('toggles expanded state when header is clicked', () => {
    const onToggle = vi.fn()
    const props = {
      blockId: 'block-1',
      blockName: 'Unit 1',
      isExpanded: false,
      childCount: 3,
      onToggle,
    }

    renderBlockSection(container, props)

    const header = container.querySelector('.block-section-header')
    header?.click()

    expect(onToggle).toHaveBeenCalledWith('block-1')
  })

  it('renders children container when expanded', () => {
    const props = {
      blockId: 'block-1',
      blockName: 'Unit 1',
      isExpanded: true,
      childCount: 2,
      onToggle: vi.fn(),
    }

    renderBlockSection(container, props)

    expect(container.querySelector('.block-section-content')).toBeTruthy()
  })

  it('hides children container when collapsed', () => {
    const props = {
      blockId: 'block-1',
      blockName: 'Unit 1',
      isExpanded: false,
      childCount: 2,
      onToggle: vi.fn(),
    }

    renderBlockSection(container, props)

    const content = container.querySelector('.block-section-content')
    expect(content).toBeTruthy()
    expect(content.style.display).toBe('none')
  })
})
