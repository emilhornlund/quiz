import { IconDefinition } from '@fortawesome/fontawesome-common-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { FC, ReactNode, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import styles from './Menu.module.scss'

export interface MenuItemProps {
  icon?: IconDefinition
  link?: string
  onClick?: () => void
  children: ReactNode
}

export const MenuItem: FC<MenuItemProps> = ({
  icon,
  link,
  onClick,
  children,
}) => {
  const navigate = useNavigate()

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()

    if (link) {
      navigate(link)
    }

    onClick?.()
  }

  return (
    <button className={styles.menuItem} onClick={handleClick}>
      <div className={styles.content}>
        {icon && <FontAwesomeIcon icon={icon} className={styles.icon} />}
        <span>{children}</span>
      </div>
    </button>
  )
}

export interface MenuProps {
  anchorRef: React.RefObject<HTMLElement>
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export const Menu: FC<MenuProps> = ({
  anchorRef,
  isOpen,
  onClose,
  children,
}) => {
  const menuRef = useRef<HTMLDivElement>(null)
  const [menuPosition, setMenuPosition] = useState<{
    top: number
    left: number
  } | null>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(event.target as Node)
      ) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose, anchorRef])

  useEffect(() => {
    if (isOpen && anchorRef.current) {
      const anchorElement = anchorRef.current

      requestAnimationFrame(() => {
        const { offsetTop, offsetLeft, offsetHeight, offsetWidth } =
          anchorElement

        setMenuPosition({
          top: offsetTop + offsetHeight + 8,
          left: offsetLeft + offsetWidth,
        })
      })
    }
  }, [isOpen, anchorRef])

  if (!isOpen || !menuPosition) return null

  return (
    <div
      ref={menuRef}
      className={styles.menu}
      style={{ top: menuPosition.top, left: menuPosition.left }}>
      {children}
    </div>
  )
}
