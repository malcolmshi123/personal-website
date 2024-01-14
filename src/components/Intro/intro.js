import React from 'react';
import './intro.css';
import bg from '../../assets/image.png';
import { faBriefcase } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-scroll';

const Intro = () => {
    return (
        <section id="intro">
            <div className="introContent">
                <span className="hello">Hello!</span>
                <span className="introText">I'm <span className="introName">Malcolm</span>,</span>
                <p className="introPara">an aspiring software engineer with experience in full-stack and game development.</p>
                <Link><button className="btn"><FontAwesomeIcon icon={faBriefcase} className="btnImg"/> Hire Me</button></Link>
            </div>
            <img src={bg} alt="Profile" className="bg"/>
        </section>
    );
}

export default Intro;