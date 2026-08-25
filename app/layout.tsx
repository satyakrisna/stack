import './globals.css'; import type {Metadata,Viewport} from 'next';
export const metadata:Metadata={title:'STACK',description:'Stack proof. One completion at a time.',appleWebApp:{capable:true,title:'STACK'}};export const viewport:Viewport={themeColor:'#050505',width:'device-width',initialScale:1,viewportFit:'cover'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
