import {
  faBinoculars,
  faGamepad,
  faLightbulb,
  faRightFromBracket,
  faUser,
} from '@fortawesome/free-solid-svg-icons'
import React, { useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import Avatar from '../../assets/images/avatar.svg'
import Bars from '../../assets/images/bars.svg'
import KlurigoIcon from '../../assets/images/klurigo-icon.svg'
import { useAuthContext } from '../../context/auth'
import { classNames } from '../../utils/helpers'
import { DeviceType, useDeviceSizeType } from '../../utils/useDeviceSizeType'
import { Menu, MenuItem, MenuSeparator } from '../Menu'

import styles from './Page.module.scss'

export interface PageProps {
  width?: 'small' | 'medium' | 'full'
  height?: 'normal' | 'full'
  align?: 'start' | 'center' | 'space-between'
  noPadding?: boolean
  discover?: boolean
  profile?: boolean
  hideLogin?: boolean
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
  hideLogin = false,
  header,
  footer,
  children,
}) => {
  const { isUserAuthenticated, revokeUser } = useAuthContext()

  const navigate = useNavigate()

  const deviceType = useDeviceSizeType()
  const isMobile = useMemo(() => deviceType === DeviceType.Mobile, [deviceType])

  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const profileMenuButtonRef = useRef<HTMLDivElement>(null)

  const toggleProfileMenu = () => setProfileMenuOpen((prev) => !prev)

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const mobileMenuButtonRef = useRef<HTMLDivElement>(null)

  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev)

  const profileMenuItems = useMemo(() => {
    if (!isUserAuthenticated || !profile) {
      return null
    }
    return (
      <>
        <MenuItem icon={faUser} link="/profile/user">
          Profile
        </MenuItem>
        <MenuItem icon={faLightbulb} link="/profile/quizzes">
          Quizzes
        </MenuItem>
        <MenuItem icon={faGamepad} link="/profile/games">
          Games
        </MenuItem>
        <MenuSeparator />
        <MenuItem icon={faRightFromBracket} onClick={revokeUser}>
          Logout
        </MenuItem>
      </>
    )
  }, [profile, isUserAuthenticated, revokeUser])

  return (
    <div className={styles.main}>
      <div className={classNames(styles.header)}>
        <button className={styles.logo} onClick={() => navigate('/')}>
          <img className={styles.icon} src={KlurigoIcon} alt="Klurigo" />
          <span className={styles.text}>Klurigo</span>
        </button>
        <div className={styles.side}>
          {isUserAuthenticated && discover && !isMobile && (
            <Link to="/discover">Discover</Link>
          )}
          {!isUserAuthenticated && !hideLogin && (
            <Link to="/auth/login">Login</Link>
          )}
          {isUserAuthenticated && discover && header && !isMobile && (
            <div className={styles.verticalLine} />
          )}
          {header}
          {isUserAuthenticated && profile && !isMobile && (
            <div
              className={styles.menuButtonWrapper}
              ref={profileMenuButtonRef}>
              <button onClick={toggleProfileMenu} type="button">
                <img src={Avatar} alt="Profile" />
              </button>
              <Menu
                anchorRef={profileMenuButtonRef}
                isOpen={profileMenuOpen}
                onClose={() => setProfileMenuOpen(false)}>
                {profileMenuItems}
              </Menu>
            </div>
          )}
          {isUserAuthenticated && isMobile && (discover || profile) && (
            <div className={styles.menuButtonWrapper} ref={mobileMenuButtonRef}>
              <button onClick={toggleMobileMenu} type="button">
                <img src={Bars} alt="Menu" />
              </button>
              <Menu
                anchorRef={mobileMenuButtonRef}
                isOpen={mobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}>
                {discover && (
                  <MenuItem icon={faBinoculars} link="/discover">
                    Discover
                  </MenuItem>
                )}
                {discover && <MenuSeparator />}
                {profileMenuItems}
              </Menu>
            </div>
          )}
        </div>
      </div>
      <div
        className={classNames(
          styles.content,
          height === 'full' ? styles.fullHeight : undefined,
          align === 'start' ? styles.startAlign : undefined,
          align === 'center' ? styles.centerAlign : undefined,
          align === 'space-between' ? styles.spaceBetweenAlign : undefined,
          noPadding ? styles.noPadding : undefined,
        )}>
        <div
          className={classNames(
            styles.contentWrapper,
            width === 'small' ? styles.smallWidth : undefined,
            width === 'medium' ? styles.mediumWidth : undefined,
            width === 'full' ? styles.fullWidth : undefined,
          )}>
          <div className={styles.contentInner}>{children}</div>
        </div>
      </div>
      {footer && <div className={classNames(styles.footer)}>{footer}</div>}
    </div>
  )
}

export default Page
