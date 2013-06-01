// ==UserScript==
// @name           IME-Colors.uc.js
// @namespace      http://d.hatena.ne.jp/Griever/
// @include        main
// @license        MIT License
// @version        0.0.9
// @note           0.0.9 変換中に IME を OFF にすると色が変わらないのを修正
// @note           0.0.7 CSS のリセットの処理を修正
// @note           0.0.6 IME_DISABLE_STYLE を空にすれば IME が OFF の時は色を変えないようにできるようにした
// @note           0.0.5 Firefox 5.0 で動くように微修正。 3.6 とかもう(ﾟ⊿ﾟ)ｼﾗﾈ
// ==/UserScript==

(function() {

window.IMEColorsClass = function(elem){
	this.init(elem);
}

IMEColorsClass.prototype = {

	IME_ENABLE_STYLE: {
		'background-image': '-moz-linear-gradient(left, #fed, #ffe)',
//		'background-color': '#fed',
		'color': 'black',
	},
	IME_DISABLE_STYLE: { // IME OFF の時に色を変えたくなければこの括弧を空にする
		'background-image': '-moz-linear-gradient(left, #def, #eff)',
//		'background-color': '#def',
		'color': 'black',
	},

	_timer: null,
	get timer() this._timer,
	set timer(t) {
		if (this._timer) clearTimeout(this._timer);
		return this._timer = t;
	},
	utils: window
		.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
		.getInterface(Components.interfaces.nsIDOMWindowUtils),
	init: function(elem) {
		var doc = elem.ownerDocument;
		this.win = doc.defaultView;
		this.inputField = elem;
		this.textbox = elem.hasAttribute('anonid')?
			doc.evaluate(
				'ancestor::*[local-name()="textbox"]',
				elem,
				null,
				XPathResult.FIRST_ORDERED_NODE_TYPE,
				null
			).singleNodeValue :
			null;

		this.elem = this.textbox || this.inputField;
		var s = this.elem.style;
		this.originalStyle = {};
		this.backupPropertyNames.forEach(function(n){
			this.originalStyle[n] = s.getPropertyValue(n);
		}, this);
		this.inputFieldStyle = this.win.getComputedStyle(this.inputField, null);
		if (this.textbox) {
			this.originalStyle['border-width'] = s.getPropertyValue('border-width');
			this.originalStyle['-moz-appearance'] = s.getPropertyValue('-moz-appearance');
			var borderWidth = this.win.getComputedStyle(this.textbox, null).borderTopWidth;
			s.setProperty('-moz-appearance', 'none', 'important');
			s.setProperty('border-width', borderWidth, 'important');
		}
		this.setColor();
		if (doc !== document)
			this.win.addEventListener('pagehide', this, false);
		this.elem.addEventListener('blur', this, false);
		this.elem.addEventListener('keyup', this, false);
		this.elem.addEventListener('compositionend', this, false);
	},
	setColor: function() {
        try{
            var ime = this.inputFieldStyle.imeMode == 'disabled'? false : this.utils.IMEIsOpen;
        }catch(e) {}

		if (this.state == ime) return;

		var obj  = ime? this.IME_ENABLE_STYLE : this.IME_DISABLE_STYLE;
		var obj2 = ime? this.IME_DISABLE_STYLE : this.IME_ENABLE_STYLE;
		var s = this.elem.style;
		Object.keys(obj2).forEach(function(n) obj[n] || s.removeProperty(n) );
		Object.keys(obj).forEach(function(n) s.setProperty(n, obj[n], 'important') );
		this.state = ime;
	},
	resetColor: function() {
		var s = this.elem.style;
		Object.keys(this.originalStyle).forEach(function(n){
			let val = this.originalStyle[n];
			val ? s.setProperty(n, val) : s.removeProperty(n);
		}, this);
	},
	handleEvent: function(event) {
		switch(event.type) {
		case 'keyup':
			var key = event.keyCode;
			if (key === 16 || key === 17 || key === 18)
				return;
			if (key > 240 || key < 33) {
				var self = this;
				this.timer = setTimeout(function(){
					self.setColor();
				}, 50);
			}
			break;
		case 'compositionend':
			this.setColor();
			break;
		case 'blur':
		case 'pagehide':
			this.timer = null;
			this.win.removeEventListener('pagehide', this, false);
			this.elem.removeEventListener('blur', this, false);
			this.elem.removeEventListener('keyup', this, false);
			this.elem.removeEventListener('compositionend', this, false);
			this.resetColor();
			break;
		}
	},
};
IMEColorsClass.prototype.backupPropertyNames = Object.keys(IMEColorsClass.prototype.IME_ENABLE_STYLE)
	.concat(Object.keys(IMEColorsClass.prototype.IME_DISABLE_STYLE))
	.filter(function(e,i,a) a.indexOf(e) === i);


function IMEColors({ originalTarget: elem }){
	if ((elem instanceof HTMLTextAreaElement ||
	     elem instanceof HTMLInputElement &&( /^(?:text|search)$/.test(elem.type) || !elem.type)) &&
	    !elem.readOnly) {
		new IMEColorsClass(elem);
	}
}

document.documentElement.addEventListener('focus', IMEColors, true);
window.addEventListener('unload', function() {
	document.documentElement.removeEventListener('focus', IMEColors, true);
}, false);

})()
