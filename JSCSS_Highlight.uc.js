// ==UserScript==
// @name           JSCSS_Highlight.uc.js
// @description    Syntax Highlight js and css.
// @namespace      http://d.hatena.ne.jp/Griever/
// @author         Griever
// @license        MIT License
// @compatibility  Firefox 10
// @charset        UTF-8
// @include        main
// @version        0.0.6
// @note           0.0.6 CSS で #FFFFFF も強調するようにした
// @note           0.0.6 pre 要素で右クリックメニューから実行できるようにした
// @note           0.0.5 URLをリンク化する正規表現を修正
// @note           0.0.3 超高速化した
// @note           0.0.2 AutoHotkey も強調してみた
// @note           0.0.2 細部の調整
// ==/UserScript==

(function(){

var BASE_Style = {
	MlutiComment   : 'color:#080;',
	LineComment    : 'color:#080;',
	DoubleQuotation: 'color:#c11;',
	SingleQuotation: 'color:#c11;',
	URL            : '',
	CDATA          : 'color:#c11;',
};

var JS_Style = {
	keyword  : 'color:#a09;',
	object   : 'color:#c15;',
	method   : 'color:#027;',
	property : 'color:#06a;',
	hougen   : 'color:#06a;',
	CDATA    : 'color:#c11;',
};

var CSS_Style = {
	keyword  : 'color:#a09;',
	pseudo   : 'color:#a09;',
	property : 'color:#06a;',
	hougen   : 'color:#06a;',
};

var AHK_Style = {
	keyword  : 'color:#a09;',
	keyword2 : 'color:#a09;',
	property : 'color:#06a;',
	key      : 'color:#06a;',
};


var JS = {};
var CSS = {};
var XML = {};
var BASE = {};
var AHK = {};


JS.keyword = [
"abstract","boolean","break","byte","case","catch","char","class","const",
"continue","debugger","default","delete","do","double","else","enum","export",
"extends","false","final","finally","float","for","function","goto","if",
"implements","import","in","instanceof","int","interface","long","native","new",
"null","package","private","protected","public","return","short","static",
"super","switch","synchronized","this","throw","throws","transient","true","try",
"typeof","var","void","volatile","while","with",
"let","yield","infinity","NaN","undefined","of"
];

JS.object = [
"Array","Boolean","Date","Error","EvalError","Function","Number","Object",
"RangeError","ReferenceError","RegExp","String","SyntaxError","TypeError",
"URIError","eval","decodeURI","decodeURIComponent","encodeURI",
"encodeURIComponent","escape","unescape","isFinite","isNaN","parseFloat",
"parseInt"
];

JS.method = [
"addEventListener","removeEventListener","handleEvent","alert","prompt",
"confirm","setTimeout","setInterval","clearTimeout","clearInterval","toString",
"toSource"
];

JS.property = [
"window","document","prototype","callee","caller","event","arguments"
];

JS.hougen = [
"$","jQuery", "opera","chrome", "gBrowser","Components",
"GM_log","GM_addStyle","GM_xmlhttpRequest","GM_openInTab",
"GM_registerMenuCommand","GM_unregisterMenuCommand","GM_enableMenuCommand",
"GM_disableMenuCommand","GM_getResourceText","GM_getResourceURL",
"GM_setValue","GM_getValue","GM_listValues","GM_deleteValue",
"GM_getMetadata","GM_setClipboard","GM_safeHTMLParser","GM_generateUUID"
];



CSS.keyword = [
"@import","@charset","@media","@font-face","@page","@namespace","@keyframes",
"!important",
"@-moz-document",
];

CSS.pseudo = [
":before",":after",":first-letter",":first-line",
"::before","::after","::first-letter","::first-line","::selection",
":root",":not", ":link",":visited",":active",":focus",":hover",
":target",":enabled",":disabled",":checked",":default",":empty",
":nth-child",":nth-of-type",":first-child",":last-child",":only-child",
":nth-last-child",":nth-last-of-type",
":first-of-type",":last-of-type",":only-of-type",

"::-moz-anonymous-block","::-moz-anonymous-positioned-block",":-moz-any",
":-moz-any-link",":-moz-bound-element",":-moz-broken","::-moz-canvas",
"::-moz-cell-content",":-moz-drag-over",":-moz-first-node","::-moz-focus-inner",
"::-moz-focus-outer",":-moz-focusring",":-moz-full-screen",":-moz-full-screen-ancestor",
":-moz-handler-blocked",":-moz-handler-crashed",":-moz-handler-disabled","::-moz-inline-table",
":-moz-last-node",":-moz-list-bullet",":-moz-list-number",":-moz-loading",
":-moz-locale-dir",":-moz-lwtheme",":-moz-lwtheme-brighttext",":-moz-lwtheme-darktext",
":-moz-math-stretchy",":-moz-math-anonymous",":-moz-only-whitespace","::-moz-page",
"::-moz-page-sequence","::-moz-pagebreak","::-moz-pagecontent",":-moz-placeholder",
":-moz-read-only",":-moz-read-write","::-moz-selection","::-moz-scrolled-canvas",
"::-moz-scrolled-content","::-moz-scrolled-page-sequence",":-moz-suppressed",
":-moz-submit-invalid","::-moz-svg-foreign-content",":-moz-system-metric",
"::-moz-table","::-moz-table-cell","::-moz-table-column","::-moz-table-column-group",
"::-moz-table-outer","::-moz-table-row","::-moz-table-row-group",":-moz-tree-checkbox",
":-moz-tree-cell",":-moz-tree-cell-text",":-moz-tree-column",":-moz-tree-drop-feedback",
":-moz-tree-image",":-moz-tree-indentation",":-moz-tree-line",":-moz-tree-progressmeter",
":-moz-tree-row",":-moz-tree-separator",":-moz-tree-twisty",":-moz-ui-invalidGecko",
":-moz-ui-validGecko",":-moz-user-disabled","::-moz-viewport","::-moz-viewport-scroll",
":-moz-window-inactive","::-moz-xul-anonymous-block"
];

CSS.property = [
"padding","margin","background","font","overflow",
"border","border-radius",
"border-color","border-width","border-style",
"border-top","border-right","border-bottom","border-left",
"outline","-moz-outline-radius","-moz-column-rule",
"-moz-padding-start","-moz-padding-end",
"-moz-margin-start","-moz-margin-end",
"-moz-border-start","-moz-border-end"
];
CSS.hougen = [];
var s = getComputedStyle(document.documentElement, null);
for(var i = 0, p; p = s[i]; i++) {
	p[0] === "-" ? CSS.hougen.push(p) : CSS.property.push(p);
}

CSS.colors = [
'aliceblue','antiquewhite','aqua','aquamarine','azure','beige','bisque','black',
'blanchedalmond','blue','blueviolet','brass','brown','burlywood','cadetblue',
'chartreuse','chocolate','coolcopper','copper','coral','cornflower',
'cornflowerblue','cornsilk','crimson','cyan','darkblue','darkbrown','darkcyan',
'darkgoldenrod','darkgray','darkgreen','darkkhaki','darkmagenta',
'darkolivegreen','darkorange','darkorchid','darkred','darksalmon','darkseagreen',
'darkslateblue','darkslategray','darkturquoise','darkviolet','deeppink',
'deepskyblue','dimgray','dodgerblue','feldsper','firebrick','floralwhite',
'forestgreen','fuchsia','gainsboro','ghostwhite','gold','goldenrod','gray',
'green','greenyellow','honeydew','hotpink','indianred','indigo','ivory','khaki',
'lavender','lavenderblush','lawngreen','lemonchiffon','lightblue','lightcoral',
'lightcyan','lightgoldenrodyellow','yellowgreen',

'ActiveBorder','ActiveCaption','AppWorkspace','Background','ButtonFace',
'ButtonHighlight','ButtonShadow','ButtonText','CaptionText','GrayText',
'Highlight','HighlightText','InactiveBorder','InactiveCaption',
'InactiveCaptionText','InfoBackground','InfoText','Menu','MenuText',
'Scrollbar','ThreeDDarkShadow','ThreeDFace','ThreeDHighlight',
'ThreeDLightShadow','ThreeDShadow','Window','WindowFrame','WindowText',

'-moz-activehyperlinktext','-moz-hyperlinktext','-moz-visitedhyperlinktext',
'-moz-buttondefault','-moz-buttonhoverface','-moz-buttonhovertext','-moz-cellhighlight',
'-moz-cellhighlighttext','-moz-field','-moz-fieldtext','-moz-dialog','-moz-dialogtext',
'-moz-dragtargetzone','-moz-mac-accentdarkestshadow','-moz-mac-accentdarkshadow',
'-moz-mac-accentface','-moz-mac-accentlightesthighlight','-moz-mac-accentlightshadow',
'-moz-mac-accentregularhighlight','-moz-mac-accentregularshadow','-moz-mac-chrome-active',
'-moz-mac-chrome-inactive','-moz-mac-focusring','-moz-mac-menuselect','-moz-mac-menushadow',
'-moz-mac-menutextselect','-moz-menuhover','-moz-menuhovertext','-moz-win-communicationstext',
'-moz-win-mediatext','-moz-nativehyperlinktext'
];


AHK.keyword = [
"#AllowSameLineComments","#ClipboardTimeout","#CommentFlag","#ErrorStdOut",
"#EscapeChar","#HotkeyInterval","#HotkeyModifierTimeout","#Hotstring",
"#IfWinExist","#IfWinNotActive","#IfWinNotExist","#Include","#IncludeAgain",
"#InstallKeybdHook","#InstallMouseHook","#KeyHistory","#LTrim","#MaxHotkeysPerInterval",
"#MaxMem","#MaxThreads","#MaxThreadsBuffer","#MaxThreadsPerHotkey","#NoEnv",
"#NoTrayIcon","#Persistent","#SingleInstance","#UseHook","#WinActivateForce",
"#IfWinActive"
];

AHK.keyword2 = [
"AutoTrim","BlockInput","Break","Click","ClipWait","CoordMode","Continue","Control",
"ControlFocus","ControlGet","ControlGetFocus","ControlGetText","ControlClick","ControlMove",
"ControlGetPos","ControlSend","ControlSendRaw","ControlSetText","Critical","DetectHiddenText",
"DetectHiddenWindows","DllCall","Abs","ACos","Asc","ASin","ATan","Ceil","Chr","Cos",
"Exp","FileExist","Floor","GetKeyState","IL_Add","IL_Create","IL_Destroy","LV_Add",
"LV_Delete","LV_DeleteCol","LV_GetCount","LV_GetNext","LV_GetText","LV_Insert","LV_InsertCol",
"LV_Modify","LV_ModifyCol","LV_SetImageList","InStr","SubStr","Ln","Log","Mod",
"Round","SB_SetIcon","SB_SetParts","SB_SetText","Sin","Sqrt","StrLen","Tan","TV_Add",
"TV_Delete","TV_GetChild","TV_GetCount","TV_GetNext","TV_Get","TV_GetParent","TV_GetPrev",
"TV_GetSelection","TV_GetText","TV_Modify","DriveSpaceFree","Edit","Else","EndRepeat",
"EnvAdd","EnvSub","EnvMult","EnvDiv","EnvGet","EnvSet","EnvSub","EnvUpdate","Exit",
"ExitApp","FileAppend","FileCopy","FileCopyDir","FileCreateDir","FileCreateShortcut",
"FileGetShortcut","FileDelete","FileInstall","FileRead","FileReadLine","FileGetAttrib",
"FileGetSize","FileGetTime","FileGetVersion","FileMove","FileMoveDir","FileRecycle",
"FileRecycleEmpty","FileRemoveDir","FileSelectFile","FileSelectFolder","FileSetAttrib",
"FileSetTime","FormatTime","GetKeyState","Gosub","Goto","GroupActivate","GroupAdd",
"GroupClose","GroupDeactivate","Gui","GuiControl","GuiControlGet","if","is","not",
"contains","HideAutoItWin","Hotkey","IfEqual","IfNotEqual","IfExist","IfNotExist",
"IfGreater","IfGreaterOrEqual","IfInString","IfNotInString","IfLess","IfLessOrEqual",
"IfMsgBox","IfWinActive","IfWinNotActive","IfWinExist","IfWinNotExist","IniDelete",
"IniRead","IniWrite","Input","InputBox","IsFunc","IsLabel","KeyHistory","KeyWait",
"LeftClick","LeftClickDrag","ListHotkeys","ListLines","ListVars","Loop","Menu","MouseClick",
"MouseClickDrag","MouseGetPos","MouseMove","MsgBox","OnExit","OnMessage","OutputDebug",
"Pause","PixelGetColor","PixelSearch","ImageSearch","NumGet","NumPut","PostMessage",
"Process","Random","RegDelete","RegExMatch","RegExReplace","RegRead","RegWrite",
"RegisterCallback","Reload","Repeat","EndRepeat","Return","RightClick","RightClickDrag",
"Run","RunAs","RunWait","Send","SendEvent","SendInput","SendMode","SendPlay","SendRaw",
"SendMessage","SetBatchLines","SetCapslockState","SetControlDelay","SetDefaultMouseSpeed",
"SetEnv","SetFormat","SetKeyDelay","SetMouseDelay","SetNumlockState","SetScrollLockState",
"SetStoreCapslockMode","SetTimer","SetTitleMatchMode","SetWinDelay","SetWorkingDir",
"Shutdown","Sleep","Sort","SoundBeep","SoundGet","SoundGetWaveVolume","SoundPlay",
"SoundSet","SoundSetWaveVolume","Progress","SplashImage","SplashTextOn","SplashTextOff",
"StatusBarGetText","StatusBarWait","StringCaseSense","StringGetPos","StringLeft",
"StringLen","StringLower","StringMid","StringReplace","StringRight","StringSplit",
"SplitPath","StringTrimLeft","StringTrimRight","StringUpper","Suspend","Thread",
"ToolTip","Transform","TrayTip","URLDownloadToFile","VarSetCapacity","WinActivate",
"WinActivateBottom","WinClose","WinGet","SysGet","Drive","DriveGet","While","WinGetActiveStats",
"WinGetActiveTitle","WinGetClass","WinGetPos","WinGetText","WinGetTitle","WinHide",
"WinKill","WinMaximize","WinMenuSelectItem","WinMinimize","WinMinimizeAll","WinMinimizeAllUndo",
"WinMove","WinRestore","WinSet","WinSetTitle","WinShow","WinWait","WinWaitActive",
"WinWaitClose","WinWaitNotActive","Clipboard","ClipboardAll","ComSpec","ProgramFiles",
"ErrorLevel","True","False","A_YEAR","A_YYYY","A_MON","A_MDAY","A_MMMM","A_MMM",
"A_MM","A_DDDD","A_DDD","A_DD","A_HOUR","A_MIN","A_SEC","A_MSEC","A_WDAY","A_YDAY",
"A_YWeek","A_Language","A_LineFile","A_LineNumber","A_AppData","A_AppDataCommon",
"A_Temp","A_ComputerName","A_UserName","A_Desktop","A_DesktopCommon","A_StartMenu",
"A_StartMenuCommon","A_Programs","A_ProgramsCommon","A_Startup","A_StartupCommon",
"A_MyDocuments","A_WORKINGDIR","A_AhkPath","A_AhkVersion","A_ScreenWidth","A_ScreenHeight",
"A_SCRIPTNAME","A_SCRIPTDIR","A_SCRIPTFULLPATH","A_NUMBATCHLINES","A_BatchLines",
"A_ExitReason","A_ThisMenu","A_ThisMenuItem","A_ThisMenuItemPos","A_EventInfo","A_Gui",
"A_GuiControl","A_GuiControlEvent","A_GuiEvent","A_GuiHeight","A_GuiWidth","A_GuiX",
"A_GuiY","A_LastError","A_Now","A_NowUTC","A_IsCompiled","A_IsSuspended","A_TitleMatchMode",
"A_TitleMatchModeSpeed","A_DetectHiddenWindows","A_DetectHiddenText","A_AutoTrim",
"A_StringCaseSense","A_FormatInteger","A_FormatFloat","A_KeyDelay","A_WinDelay",
"A_ControlDelay","A_MouseDelay","A_DefaultMouseSpeed","A_IconHidden","A_IconTip",
"A_IconFile","A_IconNumber","A_IsCritical","A_IsPaused","A_OSTYPE","A_OSVERSION",
"A_WinDir","A_ProgramFiles","A_CURSOR","A_EndChar","A_CaretX","A_CaretY","A_ISADMIN",
"A_IPADDRESS1","A_IPADDRESS2","A_IPADDRESS3","A_IPADDRESS4","A_THISFUNC","A_THISHOTKEY",
"A_THISLABEL","A_PRIORHOTKEY","A_TIMESINCETHISHOTKEY","A_TIMESINCEPRIORHOTKEY","A_TIMEIDLE",
"A_TIMEIDLEPHYSICAL","A_TICKCOUNT","A_SPACE","A_TAB","A_INDEX","A_LOOPFILENAME",
"A_LOOPFILEFULLPATH","A_LoopFileLongPath","A_LOOPFILESHORTNAME","A_LoopFileShortPath",
"A_LOOPFILEDIR","A_LoopFileExt","A_LOOPFILETIMEMODIFIED","A_LOOPFILETIMECREATED",
"A_LOOPFILETIMEACCESSED","A_LOOPFILEATTRIB","A_LOOPFILESIZE","A_LOOPFILESIZEKB",
"A_LOOPFILESIZEMB","A_LOOPREGNAME","A_LOOPREGTYPE","A_LOOPREGKEY","A_LOOPREGSUBKEY",
"A_LOOPREGTIMEMODIFIED","A_LOOPREADLINE","A_LOOPFIELD","return"
];

AHK.property = [
"RGB","PIXEL","MOUSE","SCREEN","RELATIVE","BETWEEN","IN","INTEGER","FLOAT","INTEGERFAST",
"FLOATFAST","NUMBER","DIGIT","XDIGIT","ALPHA","UPPER","LOWER","ALNUM","TIME","DATE",
"AlwaysOnTop","Topmost","Bottom","Transparent","Redraw","Region","TransColor","ID",
"IDLAST","ProcessName","MinMax","CONTROLLIST","COUNT","LIST","CAPACITY","StatusCD",
"Eject","Label","FILESYSTEM","LABEL","SETLABEL","SERIAL","TYPE","STATUS","SECONDS",
"MINUTES","HOURS","DAYS","static","global","local","ByRef","READ","PARSE","Logoff",
"Close","Error","Single","TRAY","ADD","RENAME","CHECK","UNCHECK","TOGGLECHECK","ENABLE",
"DISABLE","TOGGLEENABLE","DEFAULT","NODEFAULT","STANDARD","NOSTANDARD","DELETE",
"DELETEALL","ICON","NOICON","TIP","SHOW","MAINWINDOW","NOMAINWINDOW","USEERRORLEVEL",
"AltTab","ShiftAltTab","AltTabMenu","AltTabAndMenu","AltTabMenuDismiss","Unicode",
"Asc","Chr","Deref","Mod","Pow","Exp","Sqrt","Log","Ln","Round","Ceil","Floor","Abs",
"Sin","Cos","Tan","ASin","ACos","ATan","BitNot","BitAnd","BitOr","BitXOr","BitShiftLeft",
"BitShiftRight","YES","NO","OK","CANCEL","ABORT","RETRY","IGNORE","TRYAGAIN","HKEY_LOCAL_MACHINE",
"HKEY_USERS","HKEY_CURRENT_USER","HKEY_CLASSES_ROOT","HKEY_CURRENT_CONFIG","HKLM","HKU",
"HKCU","HKCR","HKCC","REG_SZ","REG_EXPAND_SZ","REG_MULTI_SZ","REG_DWORD","REG_BINARY",
"Font","Resize","Owner","Submit","NoHide","Minimize","Maximize","Restore","NoActivate",
"NA","Cancel","Destroy","Center","Text","Picture","Pic","GroupBox","Button","Checkbox",
"Radio","DropDownList","DDL","ComboBox","ListBox","ListView","DateTime","MonthCal",
"UpDown","Slider","StatusBar","TreeView","Tab","Tab2","Disabled","LastFound","LastFoundExist",
"TabStop","Section","AltSubmit","Wrap","HScroll","VScroll","Border","Top","Bottom",
"Number","Uppercase","Lowercase","Limit","Password","Multi","WantReturn","Group",
"Background","Buttons","Expand","First","ImageList","Lines","WantCtrlA","WantF2",
"Vis","VisFirst","Theme","Caption","Delimiter","MinimizeBox","MaximizeBox","SysMenu",
"ToolWindow","Flash","Style","ExStyle","Check3","Checked","CheckedGray","ReadOnly",
"Password","Hidden","Left","Right","Center","NoTab","Section","Move","Focus","Hide",
"Choose","ChooseString","Text","Pos","Enabled","Visible","ahk_id","ahk_pid","ahk_class",
"ahk_group"
];

AHK.key = [
"LButton","RButton","MButton","WheelDown","WheelUp","XButton1","XButton2","Joystick",
"Joy1","Joy2","Joy3","Joy4","Joy5","Joy6","Joy7","Joy8","Joy9","Joy10",
"Joy11","Joy12","Joy13","Joy14","Joy15","Joy16","Joy17","Joy18","Joy19","Joy20",
"Joy21","Joy22","Joy23","Joy24","Joy25","Joy26","Joy27","Joy28","Joy29","Joy30",
"Joy31","Joy32","JoyX","JoyY","JoyZ","JoyR","JoyU","JoyV","JoyPOV","JoyName",
"JoyButtons","JoyAxes","JoyInfo",
"Space","Tab","Return","Esc","BS","Del","Ins","Home","End","PgUp","PgDn","Up","Down",
"Left","Right","ScrollLock","CapsLock","NumLock","NumpadDiv","NumpadMult",
"NumpadAdd","NumpadSub","NumpadEnter","NumpadDel","NumpadIns","NumpadClear","NumpadUp",
"NumpadDown","NumpadLeft","NumpadRight","NumpadHome","NumpadEnd","NumpadPgUp","NumpadPgDn",
"Numpad0","Numpad1","Numpad2","Numpad3","Numpad4","Numpad5","Numpad6","Numpad7",
"Numpad8","Numpad9","NumpadDot","F1","F2","F3","F4","F5","F6","F7","F8","F9","F10",
"F11","F12","F13","F14","F15","F16","F17","F18","F19","F20","F21","F22","F23","F24",
"AppsKey","Shift","Ctrl","Alt","LWin","RWin","LShift","LCtrl","LAlt","RShift","RCtrl",
"RAlt","PrintScreen","CtrlBreak","Pause","Break","Help","Sleep","Browser_Back",
"Browser_Forward","Browser_Refresh","Browser_Stop","Browser_Search","Browser_Favorites",
"Browser_Home","Volume_Mute","Volume_Down","Volume_Up","Media_Next","Media_Prev",
"Media_Stop","Media_Play_Pause","Launch_Mail","Launch_Media","Launch_App1","Launch_App2"
];


var JS_Words = {};
Object.keys(JS).forEach(function(key){
	JS[key].forEach(function(word){
		JS_Words[word] = JS_Style[key];
	});
});

var CSS_Words = {};
Object.keys(CSS).forEach(function(key){
	CSS[key].forEach(function(word){
		CSS_Words[word] = key === "colors" ? "color: " + word + ";" : CSS_Style[key];
	});
});

var AHK_Words = {};
Object.keys(AHK).forEach(function(key){
	AHK[key].forEach(function(word){
		AHK_Words[word] = AHK_Style[key];
	});
});

//JS.regexp_r   = "\\\/\(\(\?\:\\\\\.\|\\\[\(\?\:\\\\\.\|\[\^\\\]\]\)\*\\\]\|\[\^\\\/\\n\]\)\{0\,100\}\)\\\/\(\[gimy\]\*\)";

AHK.SComment_r  = '^\\;.*|\\s+\\;.*';
XML.MComment_r  = '&lt\\;!--[\\s\\S]+?--&gt\\;';
BASE.URL_r      = ['h?t?tps?://\\w+\\.wikipedia\\.org/wiki/[^\\s<]+'
                  ,'(?:h?t?tps?|ftp)://[\\w\\-]+\\.[\\w.\\-]+(?:[\\w#%=~^_?.;:+*/\\-]|&amp\\;)*'
                  ,'(?:chrome|resource)://[\\w/.#()\\-]+'
                  ,'(?:jar:)?file:///\\w:/[\\w/.#()\\-]+'
                  ,'data:\\w+/[a-zA-Z-]+\\;[\\w-]+?\\,[a-zA-Z0-9/+%\\s\\\\]+={0,2}'
                  ].join('|');
BASE.MComment_r = "/\\*[\\s\\S]*?\\*/";
BASE.SComment_r = "//.*";
BASE.DString_r  = '"(?:[^\\n"\\\\]|\\\\.|\\\\\\n)*"';
BASE.SString_r  = "'(?:[^\\n'\\\\]|\\\\.|\\\\\\n)*'";
BASE.CDATA_r    = "&lt\\;\\!\\[CDATA\\[[\\s\\S\]*?\\]\\]&gt\\;";

AHK.R_SComment = new RegExp(AHK.SComment_r, "gm");
BASE.R_URL = new RegExp(BASE.URL_r, "gm");

JS.R_ALL = new RegExp([
	BASE.MComment_r
	,BASE.SComment_r
	,BASE.DString_r
	,BASE.SString_r
	,BASE.CDATA_r
	,'[\\w$]+'
].join('|'), "gm");

CSS.R_ALL = new RegExp([
	BASE.MComment_r
	,BASE.DString_r
	,BASE.SString_r
	,'(?::?:|\\b|@)[a-zA-Z\\-]+\\b'
	,'\\!important\\b'
	,'#[0-9A-Fa-f]{3}[0-9A-Fa-f]{3}?'
].join('|'), "gm");

AHK.R_ALL = new RegExp([
	BASE.MComment_r
	,AHK.SComment_r
	,BASE.DString_r
	,BASE.SString_r
	,'^#[a-zA-Z]+\\b'
	,'\\w+'
].join('|'), "gm");

XML.R_ALL = new RegExp([
	XML.MComment_r
	,BASE.CDATA_r
	,BASE.DString_r
	,BASE.SString_r
].join('|'), "gm");

BASE.R_ALL = new RegExp([
	XML.MComment_r
	,BASE.DString_r
	,BASE.SString_r
	,'[\\w$]+'
].join('|'), "gm");

function parseLink(aText) {
	return aText.replace(BASE.R_URL, function(str){
		var url = str;
		if (url.indexOf("data:image/") === 0)
			return '<img src="'+ url.replace(/\\/g, '') +'" alt="'+ str +'">';

		url = url.replace(/^h?t?tp(s)?/,'http$1');
		return '<a href="'+ url +'" style="'+ BASE_Style.URL +'">'+ str +'</a>';
	});
}

function parse(aText, type) {
	aText = aText.replace(/\&/g, '&amp;').replace(/\</g, '&lt;').replace(/\>/g, '&gt;');
	if (type === "CSS") aText = CSSParser(aText);
	else if (type === "JS") aText = JSParser(aText);
	else if (type === "XML") aText = XMLParser(aText);
	else if (type === "AHK") aText = AHKParser(aText);
	else aText = TXTParser(aText);

	aText = parseLink(aText);
	return aText;
}

function JSParser(aText) {
	return aText.replace(JS.R_ALL, function(str, offset, s) {
		if (str.indexOf("//") === 0) {
			return '<span style="'+ BASE_Style.LineComment +'">' + str + '</span>';
		}
		if (str.indexOf("/*") === 0) {
			return '<span style="'+ BASE_Style.MlutiComment +'">' + str + '</span>';
		}
		if (str[0] === "'") {
			return '<span style="'+ BASE_Style.DoubleQuotation +'">' + str.replace(/\"/g, "&quot;").replace(/\'/g, "&apos;") + '</span>';
		}
		if (str[0] === '"') {
			return '<span style="'+ BASE_Style.SingleQuotation +'">' + str.replace(/\"/g, "&quot;").replace(/\'/g, "&apos;") + '</span>';
		}
		if (str.indexOf("&lt;![CDATA[") === 0) {
			if (/^\s*\@|\!important|url\(/.test(str))
				return CSSParser(str);
			return '<span style="'+ (JS_Style.CDATA || BASE_Style.CDATA) +'">' + str + '</span>';
		}
		if (JS_Words[str]) {
			return '<span style="'+ JS_Words[str] +'">' + str + '</span>';
		}
		return str;
	});
}

function XMLParser(aText) {
	return aText.replace(XML.R_ALL, function(str, offset, s) {
		if (str.indexOf("&lt;!--") === 0) {
			return '<span style="'+ BASE_Style.MlutiComment +'">' + str + '</span>';
		}
		if (str[0] === "'") {
			return '<span style="'+ BASE_Style.DoubleQuotation +'">' + str.replace(/\"/g, "&quot;").replace(/\'/g, "&apos;") + '</span>';
		}
		if (str[0] === '"') {
			return '<span style="'+ BASE_Style.SingleQuotation +'">' + str.replace(/\"/g, "&quot;").replace(/\'/g, "&apos;") + '</span>';
		}
		if (str.indexOf("&lt;![CDATA[") === 0) {
			let res = JSParser(str.replace("&lt;![CDATA[", "").replace("]]&gt;", ""));
			return "&lt;![CDATA[" + res + "]]&gt;";
		}
		return str;
	});
}

function CSSParser(aText) {
	return aText.replace(CSS.R_ALL, function(str, offset, s) {
		if (str.indexOf("/*") === 0) {
			return '<span style="'+ BASE_Style.MlutiComment +'">' + str + '</span>';
		}
		if (str[0] === "'") {
			return '<span style="'+ BASE_Style.DoubleQuotation +'">' + str.replace(/\"/g, "&quot;").replace(/\'/g, "&apos;") + '</span>';
		}
		if (str[0] === '"') {
			return '<span style="'+ BASE_Style.SingleQuotation +'">' + str.replace(/\"/g, "&quot;").replace(/\'/g, "&apos;") + '</span>';
		}
		if (str[0] === '#') {
			return '<span style="color:'+ str +';">' + str + '</span>';
		}
		if (CSS_Words[str]) {
			return '<span style="'+ CSS_Words[str] +'">' + str + '</span>';
		}
		return str;
	});
}
function AHKParser(aText) {
	return aText.replace(AHK.R_ALL, function(str, offset, s) {
		if (str.indexOf("/*") === 0) {
			return '<span style="'+ BASE_Style.MlutiComment +'">' + str + '</span>';
		}
		if (str[0] === ";" || /^\s+;/.test(str)) {
			return '<span style="'+ BASE_Style.LineComment +';">' + str + '</span>';
		}
		if (str[0] === "'") {
			return '<span style="'+ BASE_Style.DoubleQuotation +'">' + str.replace(/\"/g, "&quot;").replace(/\'/g, "&apos;") + '</span>';
		}
		if (str[0] === '"') {
			return '<span style="'+ BASE_Style.SingleQuotation +'">' + str.replace(/\"/g, "&quot;").replace(/\'/g, "&apos;") + '</span>';
		}
		if (AHK_Words[str]) {
			return '<span style="'+ AHK_Words[str] +'">' + str + '</span>';
		}
		return str;
	});
}

function TXTParser(aText) {
	return aText.replace(BASE.R_ALL, function(str, offset, s) {
		if (str.indexOf("/*") === 0) {
			return '<span style="'+ BASE_Style.MlutiComment +'">' + str + '</span>';
		}
		if (str.indexOf("&lt;!--") === 0) {
			return '<span style="'+ BASE_Style.MlutiComment +'">' + str + '</span>';
		}
		if (str[0] === "'") {
			return '<span style="'+ BASE_Style.DoubleQuotation +'">' + str.replace(/\"/g, "&quot;").replace(/\'/g, "&apos;") + '</span>';
		}
		if (str[0] === '"') {
			return '<span style="'+ BASE_Style.SingleQuotation +'">' + str.replace(/\"/g, "&quot;").replace(/\'/g, "&apos;") + '</span>';
		}
		return str;
	});
}

if (window.JSCSS) {
	window.JSCSS.destroy();
	delete window.JSCSS;
}

var _disabled = true;
window.JSCSS = {
	get disabled () _disabled,
	set disabled (bool) {
		if (_disabled != bool) {
			if (bool) {
				gBrowser.mPanelContainer.removeEventListener("DOMContentLoaded", this, false);
			} else {
				gBrowser.mPanelContainer.addEventListener("DOMContentLoaded", this, false);
			}
		}
		var elem = document.getElementById("JSCSS-menuitem");
		if (elem)
			elem.setAttribute("checked", !bool);
		return _disabled = !!bool;
	},
	init: function() {
		var menuitem = document.createElement("menuitem");
		menuitem.setAttribute("id", "JSCSS-menuitem");
		menuitem.setAttribute("label", "JSCSS Highlight");
		menuitem.setAttribute("type", "checkbox");
		menuitem.setAttribute("checked", "true");
		menuitem.setAttribute("autoCheck", "false");
		menuitem.setAttribute("oncommand", "JSCSS.disabled = !JSCSS.disabled;");
		var ins = document.getElementById("devToolsSeparator");
		ins.parentNode.insertBefore(menuitem, ins);

		var menu = document.createElement("menu");
		menu.setAttribute("id", "JSCSS-context-menu");
		menu.setAttribute("label", "JSCSS Highlight");
		var popup = menu.appendChild(document.createElement("menupopup"));
		popup.setAttribute("id", "JSCSS-context-menupopup");
		var menuitem = popup.appendChild(document.createElement("menuitem"));
		menuitem.setAttribute("label", "JavaScript");
		menuitem.setAttribute("oncommand", "JSCSS.write(gContextMenu.target, 'JS');");
		var menuitem = popup.appendChild(document.createElement("menuitem"));
		menuitem.setAttribute("label", "CSS");
		menuitem.setAttribute("oncommand", "JSCSS.write(gContextMenu.target, 'CSS');");
		var menuitem = popup.appendChild(document.createElement("menuitem"));
		menuitem.setAttribute("label", "XML");
		menuitem.setAttribute("oncommand", "JSCSS.write(gContextMenu.target, 'XML');");
		var menuitem = popup.appendChild(document.createElement("menuitem"));
		menuitem.setAttribute("label", "AutoHotkey");
		menuitem.setAttribute("oncommand", "JSCSS.write(gContextMenu.target, 'AHK');");
		var menuitem = popup.appendChild(document.createElement("menuitem"));
		menuitem.setAttribute("label", "Text");
		menuitem.setAttribute("oncommand", "JSCSS.write(gContextMenu.target, 'TXT');");
		var context = document.getElementById("contentAreaContextMenu");
		context.appendChild(menu);

		this.disabled = false;
		context.addEventListener("popupshowing", this, false);
		window.addEventListener("unload", this, false);
	},
	uninit: function() {
		document.getElementById("contentAreaContextMenu").removeEventListener("popupshowing", this, false);
		this.disabled = true;
	},
	destroy: function() {
		this.disabled = true;
		["JSCSS-menuitem", "JSCSS-context-menu"].forEach(function(id){
			var elem = document.getElementById(id);
			if (elem) elem.parentNode.removeChild(elem);
		}, this);
		this.uninit();
	},
	handleEvent: function(event) {
		switch(event.type){
			case "popupshowing":
				var elem = document.getElementById("JSCSS-context-menu");
				if (elem)
					elem.hidden = !(gContextMenu.target instanceof HTMLPreElement);
				break;
			case "DOMContentLoaded":
				var doc = event.target;
				if (!/css|javascript|plain/.test(doc.contentType) || 
				    doc.location.protocol === "view-source:"
				) return;
				this.run(doc, 300000);
				break;
			case "unload":
				this.uninit();
				break;
		}
	},
	write: function(pre, type) {
		var doc = pre.ownerDocument;
		if (!type) {
			var { contentType, URL } = doc;
			type = contentType.indexOf('javascript') >= 0 ? 'JS' :
				contentType.indexOf('css') >= 0 ? 'CSS' :
				contentType === 'text/plain' ?
					/\.(?:xul|xml)(?:\.txt)?$/.test(URL) ? 'XML' :
					/\.(?:js|jsm|jsee|ng)(?:\.txt)?$/i.test(URL) ? 'JS' :
					/\.(?:css)$/i.test(URL) ? 'CSS' :
					/\.(?:ahk)(?:\.txt)?$|\/autohotkey\.ini$/.test(URL) ? 'AHK' :
					'TXT' :
				'TXT';
		}
		var html = parse(pre.textContent, type);
		var preRange = doc.createRange();
		preRange.selectNodeContents(pre);
		preRange.deleteContents();
		
		var range = doc.createRange();
		range.selectNodeContents(doc.body);
		var df = range.createContextualFragment(html);
		range.detach();
		preRange.insertNode(df);
		preRange.detach();
	},
	run: function(doc, maxLength) {
		var self = this;
		doc || (doc = content.document);
		var pre = doc.getElementsByTagName('pre')[0];
		if (pre.textContent.length > maxLength) {
			var browser = gBrowser.getBrowserForDocument(doc);
			var notificationBox = gBrowser.getNotificationBox(browser);
			var message = "Der Text ist zu lang. Wollen Sie hervorheben? (Es besteht Absturzgefahr!)"
			var buttons = [{
				label: "Ja",
				accessKey: "J",
				callback: function (aNotification, aButton) {
					 self.write(pre);
				}
			}];
			notificationBox.appendNotification(
				message, "JSCSS",
				"chrome://browser/skin/Info.png",
				notificationBox.PRIORITY_INFO_MEDIUM,
				buttons);
			return;
		}
		self.write(pre);
	},
};
JSCSS.init();

})();
