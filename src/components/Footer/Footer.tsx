import './Footer.style.scss';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-icons">
          <img src="/images/tech/html5.svg" alt="HTML5" />
          <img src="/images/tech/css3.svg" alt="CSS3" />
          <img src="/images/tech/javascript.svg" alt="JavaScript" />
          <img src="/images/tech/nodejs.svg" alt="Node.js" />
          <img src="/images/tech/ubuntu.svg" alt="Ubuntu" />
          <img src="/images/tech/gemini.svg" alt="Gemini" />
        </div>
        <p>
          Разработка:
          <a href="https://discordapp.com/users/archdeuce">archdeuce</a> •
          Тестирование:
          <a href="https://discordapp.com/users/virusit">Virusit</a>
        </p>

        <p>
          © {new Date().getFullYear()} PoE OCR Project. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
