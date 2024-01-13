import React from 'react';
import './navbar.css';
import { faM } from '@fortawesome/free-solid-svg-icons';
import { faMessage } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-scroll';

const Navbar = () => {
    return (
        <nav className="navbar">
            <FontAwesomeIcon icon={faM} className="logo"/>
            <div className="desktopMenu">
                <Link className="desktopMenuListItem">Home</Link>
                <Link className="desktopMenuListItem">About</Link>
                <Link className="desktopMenuListItem">Portfolio</Link>
                <Link className="desktopMenuListItem">Experience</Link>
            </div>
            <button className="desktopMenuBtn">
                <FontAwesomeIcon icon={faMessage} className="desktopMenuImg"/>Contact Me
            </button>
        </nav>
    )
}

export default Navbar;