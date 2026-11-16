// 正式网址固定，避免本地预览地址或带参数的iframe地址进入分享。
export const SHARE_URL='https://noillirk.co/kegillion/';
export const platforms=[
 {id:'x',name:'X',direct:true},
 {id:'instagram',name:'Instagram',url:'https://www.instagram.com/'},
 {id:'youtube',name:'YouTube',url:'https://www.youtube.com/'},
 {id:'reddit',name:'Reddit',direct:true},
 {id:'tiktok',name:'TikTok',url:'https://www.tiktok.com/'}
];
export function shareLink(id,text){
 if(id==='x')return 'https://x.com/intent/tweet?'+new URLSearchParams({text:text.replace(SHARE_URL,'').trim(),url:SHARE_URL});
 if(id==='reddit')return 'https://www.reddit.com/submit?'+new URLSearchParams({url:SHARE_URL,title:text.replace(SHARE_URL,'').replace(/\n/g,' ').trim()});
 throw Error('This platform requires a manual post.');
}
export function platformIcon(id){const paths={
 x:'<path d="M4 3h5l11 18h-5zM20 3 4 21"/>',
 instagram:'<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor"/>',
 youtube:'<rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 6 3-6 3z" fill="currentColor"/>',
 reddit:'<ellipse cx="12" cy="14" rx="8" ry="6"/><circle cx="8" cy="13" r="1" fill="currentColor"/><circle cx="16" cy="13" r="1" fill="currentColor"/><path d="M8 16q4 3 8 0M12 8l2-6 5 1"/><circle cx="20" cy="3" r="2"/><path d="M4 10C0 7 0 15 4 15M20 10c4-3 4 5 0 5"/>',
 tiktok:'<path d="M14 3v13a4 4 0 1 1-4-4v3a1 1 0 1 0 1 1V3zm0 0c1 4 3 5 7 5v3c-3 0-5-1-7-3"/>'
 };return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[id]}</svg>`;}
