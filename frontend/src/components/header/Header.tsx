import './header.css';
import YearSelect from './YearSelect';
import LayoutSelect from './LayoutSelect';
import LanguageSelect from './LanguageSelect';


function Header() {

  return (
    <header>
      <h1>
        <a href="https://github.com/arthurlcs/klimarisk.france" target="_blank" rel="noopener noreferrer">
          Klimarisk
        </a>
      </h1>
      <div className="headerControls">
        <LayoutSelect />
        <YearSelect />
      </div>
      <LanguageSelect />
    </header>
  )
}

export default Header;