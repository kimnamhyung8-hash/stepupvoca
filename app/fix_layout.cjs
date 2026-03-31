const fs = require('fs');
let code = fs.readFileSync('src/screens/CommunityForumScreen.tsx', 'utf-8');

const searchPointStr = 'text-white font-black px-5 py-2.5 md:px-6 md:py-3 rounded-full shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 transition-all shrink-0\">';
let idx1 = code.indexOf(searchPointStr);
if(idx1 !== -1){
   let idx2 = code.indexOf('<div className=\"relative pt-2 editor-container min-h-[400px]\">', idx1);
   if(idx2 !== -1){
      const headerCloseIdx = code.indexOf('</div>', idx1) + 6;
      const replacement = `

        {/* Scrollable Content Area - the only part that shrinks/scrolls when keyboard opens */}
        <div className="flex-1 overflow-y-auto w-full relative bg-slate-50/20">
           <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-4 pb-64 min-h-full">
              {/* 1. Title Input (Bigger, clearly separated) */}
              <input type="text" className="w-full text-2xl md:text-3xl font-black border-none focus:ring-0 placeholder:text-slate-300 bg-transparent p-0 leading-tight pt-2" placeholder={tComm(lang, 'enter_title')} value={title} onChange={(e) => setTitle(e.target.value)} />

              {/* 2. Category Dropdown (Smaller, below title) */}
              <div className="flex items-center">
                 <select 
                    value={draftCategory} 
                    onChange={e => setDraftCategory(e.target.value)} 
                    disabled={!!initialPost}
                    className="bg-indigo-50 text-indigo-700 font-bold px-3 py-1.5 rounded-lg text-[13px] border-none focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                 >
                    {CATEGORY_GROUPS[0].items.filter(item => !['ALL', 'HOT', 'MY_POSTS'].includes(item.id)).map(item => (
                       <option key={item.id} value={item.id}>{item.icon} {tComm(lang, item.name_key)}</option>
                    ))}
                 </select>
              </div>

              {/* 3. Toolbar - Compacted right above content */}
              <div className="bg-white border border-slate-200 rounded-[16px] overflow-x-auto no-scrollbar shadow-sm sticky top-0 z-10 mx-[-4px]">
                 <div className="flex items-center px-2 py-1.5 md:px-4 md:py-2 gap-1 min-w-max">
                   <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 hover:bg-slate-50 text-slate-600 px-3 py-1.5 rounded-xl transition-all">
                       <ImageIcon size={16} /> <span className="text-[11px] font-bold">{tComm(lang, 'image')}</span>
                   </button>
                   <button onClick={() => setShowVideoModal(true)} className="flex items-center gap-1.5 hover:bg-slate-50 text-slate-600 px-3 py-1.5 rounded-xl transition-all">
                       <Video size={16} /> <span className="text-[11px] font-bold">{tComm(lang, 'video')}</span>
                   </button>
                   <div className="w-px h-5 bg-slate-100 mx-1" />
                   <div className="flex bg-slate-50 p-0.5 rounded-xl">
                     <button onClick={() => editor?.chain().focus().toggleBold().run()} className={\`p-1.5 rounded-lg transition-all \${editor?.isActive('bold') ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}\`}><Bold size={14} /></button>
                     <button onClick={() => editor?.chain().focus().toggleItalic().run()} className={\`p-1.5 rounded-lg transition-all \${editor?.isActive('italic') ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}\`}><Italic size={14} /></button>
                     <button onClick={() => editor?.chain().focus().toggleUnderline().run()} className={\`p-1.5 rounded-lg transition-all \${editor?.isActive('underline') ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}\`}><UnderlineIcon size={14} /></button>
                   </div>
                   <div className="w-px h-5 bg-slate-100 mx-1" />
                   <div className="flex bg-slate-50 p-0.5 rounded-xl">
                     <button onClick={() => editor?.chain().focus().setTextAlign('left').run()} className={\`p-1.5 rounded-lg transition-all \${editor?.isActive({ textAlign: 'left' }) ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}\`}><AlignLeft size={14} /></button>
                     <button onClick={() => editor?.chain().focus().setTextAlign('center').run()} className={\`p-1.5 rounded-lg transition-all \${editor?.isActive({ textAlign: 'center' }) ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}\`}><AlignCenter size={14} /></button>
                     <button onClick={() => editor?.chain().focus().setTextAlign('right').run()} className={\`p-1.5 rounded-lg transition-all \${editor?.isActive({ textAlign: 'right' }) ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}\`}><AlignRight size={14} /></button>
                   </div>
                   <div className="w-px h-5 bg-slate-100 mx-1" />
                   <button onClick={() => editor?.chain().focus().setColor('#f43f5e').run()} className="p-1.5 rounded-xl hover:bg-rose-50 text-rose-400 transition-all"><Palette size={14} /></button>
                   <button onClick={() => editor?.chain().focus().toggleHighlight({ color: '#fef08a' }).run()} className={\`p-1.5 rounded-xl transition-all \${editor?.isActive('highlight') ? 'bg-amber-400 text-white shadow-sm' : 'hover:bg-amber-50 text-amber-400'}\`}><Highlighter size={14} /></button>
                   <button onClick={() => setShowEmojiPicker(true)} className="flex items-center gap-1 hover:bg-amber-50 text-amber-500 px-3 py-1.5 rounded-xl transition-all ml-1"><Smile size={14} /> <span className="text-[11px] font-bold">Emoji</span></button>
                 </div>
              </div>

              `;
      const newCode = code.slice(0, headerCloseIdx) + replacement + code.slice(idx2);
      fs.writeFileSync('src/screens/CommunityForumScreen.tsx', newCode);
      console.log('SUCCESS');
   } else console.log('not found 2');
} else console.log('not found 1');
