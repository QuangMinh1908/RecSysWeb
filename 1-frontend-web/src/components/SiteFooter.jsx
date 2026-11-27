import { ArrowUp } from 'lucide-react'

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-inner">
        <span>SÀN.STYLE</span>
        <a href="#top">Về đầu trang <ArrowUp size={16} aria-hidden="true" /></a>
      </div>
    </footer>
  )
}
