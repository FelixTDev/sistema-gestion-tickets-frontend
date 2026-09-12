import { Outlet } from 'react-router-dom'
import { AcademicDisclaimer } from './academic-disclaimer'
import { BrandHeader } from './brand-header'
import { Footer } from './footer'
import { PublicNavigation } from './public-navigation'

export function PublicLayout() { return <div className="site-shell public-shell"><header className="public-header"><div className="header-inner"><BrandHeader /><PublicNavigation /></div></header><AcademicDisclaimer /><main><Outlet /></main><Footer /></div> }
