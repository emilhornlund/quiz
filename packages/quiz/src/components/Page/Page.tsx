import {
  faClockRotateLeft,
  faLink,
  faUser,
} from '@fortawesome/free-solid-svg-icons'
import React, { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import Avatar from '../../assets/images/avatar.svg'
import { classNames } from '../../utils/helpers'
import { Menu, MenuItem } from '../Menu'

import styles from './Page.module.scss'

export interface PageProps {
  width?: 'small' | 'medium' | 'full'
  height?: 'normal' | 'full'
  align?: 'start' | 'center' | 'space-between'
  noPadding?: boolean
  discover?: boolean
  profile?: boolean
  header?: React.ReactNode
  footer?: React.ReactNode
  children: React.ReactNode | React.ReactNode[]
}

const Page: React.FC<PageProps> = ({
  width = 'full',
  height = 'normal',
  align = 'center',
  noPadding = false,
  discover = false,
  profile = false,
  header,
  footer,
  children,
}) => {
  const navigate = useNavigate()

  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const profileButtonRef = useRef<HTMLDivElement>(null)

  const toggleProfileMenu = () => setProfileMenuOpen((prev) => !prev)

  return (
    <div className={styles.main}>
      <div className={classNames(styles.header)}>
        <button className={styles.logo} onClick={() => navigate('/')}>
          <span className={styles.icon} />
          <span className={styles.text}>Quiz</span>
        </button>
        <div className={styles.side}>
          {discover && <Link to="/discover">Discover</Link>}
          {header}
          {profile && (
            <div className={styles.avatar} ref={profileButtonRef}>
              <button onClick={toggleProfileMenu} type="button">
                <img src={Avatar} alt="Profile" />
              </button>
              <Menu
                anchorRef={profileButtonRef}
                isOpen={profileMenuOpen}
                onClose={() => setProfileMenuOpen(false)}>
                <MenuItem icon={faUser} link="/player/profile">
                  Profile
                </MenuItem>
                <MenuItem icon={faClockRotateLeft} link="/game/history">
                  History
                </MenuItem>
                <MenuItem icon={faLink} link="/player/link">
                  Link
                </MenuItem>
              </Menu>
            </div>
          )}
        </div>
      </div>
      <div
        className={classNames(
          styles.content,
          width === 'small' ? styles.smallWidth : undefined,
          width === 'medium' ? styles.mediumWidth : undefined,
          width === 'full' ? styles.fullWidth : undefined,
          height === 'full' ? styles.fullHeight : undefined,
          align === 'start' ? styles.startAlign : undefined,
          align === 'center' ? styles.centerAlign : undefined,
          align === 'space-between' ? styles.spaceBetweenAlign : undefined,
          noPadding ? styles.noPadding : undefined,
        )}>
        {children}
      </div>
      {footer && <div className={classNames(styles.footer)}>{footer}</div>}
    </div>
  )
}

export default Page
