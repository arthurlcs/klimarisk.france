import './Header.css';
import YearSelect from './YearSelect';
import LayoutSelect from './LayoutSelect';
import LanguageSelect from './LanguageSelect';


function Header() {

  return (
    <header>
      <h1>
        Klimarisk
      </h1>
      <div className="headerControls">
        <YearSelect />
        <LayoutSelect />
        <LanguageSelect />
      </div>
    </header>
  )
}

export default Header;