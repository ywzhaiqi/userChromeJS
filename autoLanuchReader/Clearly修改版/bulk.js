$(function ()
{
	(function ($R)
	{
		//	vars
		//	====
			$R.$win = $($R.win);
			$R.$document = $($R.document);
            $R.pagesCount = 1;  // there's always at least 1 page

            $R.afterShowRunThese = [];

		//	local debug
		//	===========


        //  debug in extensions?
        //  ====================
            $R.debug = false;

		//	debug
		//	=====

    //  random number
    $R.rand = function (_min, _max) {
        return (Math.floor(Math.random() * (_max - _min + 1)) + _min);
    };

	//	defaults to false
	if ($R.debug); else { $R.debug = false; }

	//	make it faster -- when not debugging
	//	==============
	if (!($R.debug))
	{
		$R.debugRemember = {};

		$R.writeLog 		= function () { return false; };
		$R.log 				= function () { return false; };

		$R.debugTimerStart 	= function () { return false; };
		$R.debugTimerEnd 	= function () { return false; };

		$R.debugPrint 		= function () { return false; };
		$R.printDebugOutput = function () { return false; };

		$R.debugOutline 	= function () { return false; };
	}
	else
	{
		//	remember stuff
			$R.debugRemember = {};

		//	vars
		//	====
			$R.debugStuff = [];
			$R.debugTimers = [];

		//	write log
		//	=========
			$R.initializeWriteLogFunction = function ()
			{
				switch (true)
				{
					case (!(!($R.win.console && $R.win.console.log))):
						$R.writeLog = function (msg) { $R.win.console.log(msg); };
						break;

					case (!(!($R.win.opera && $R.win.opera.postError))):
						$R.writeLog = function (msg) { $R.win.opera.postError(msg); };
						break;

					default:
						$R.writeLog = function (msg) {};
						break;
				}
			};

		//	log
		//	===
			$R.initializeWriteLogFunction();
			$R.log = function ()
			{
                if ($R.debug); else { return; }

				for (var i=0, il=arguments.length; i<il ; i++)
					{ $R.writeLog(arguments[i]); }

				$R.writeLog('-----------------------------------------');
			};

		//	outline
		//	=======
			$R.debugOutline = function (_element, _category, _reason)
			{
				switch (true)
				{
                    case (!$R.debug):
					case (!(_element.nodeType === 1)):
					case (!(_element.tagName > '')):
					case (_element.tagName.toLowerCase() == 'onject'):
					case (_element.tagName.toLowerCase() == 'embed'):
						return;
                }

                var
                    _outline = '#ff5500',
                    _background = 'rgba(255, 85, 0, 0.5)'
                ;

                //  choose
                switch (true)
                {
                    case (_category == 'target' && _reason == 'first'):
                        _outline = '#00cc00';
                        _background = 'rgba(0, 255, 0, 0.5)';
                        break;

                    case (_category == 'target' && _reason == 'second'):
                        _outline = '#0000cc';
                        _background = 'rgba(0, 0, 255, 0.5)';
                        break;

                    //  =====

                    case (_category == 'target' && _reason == 'next-page'):
                        _outline = '#FF80C0';
                        _background = 'rgba(255, 128, 192, 0.5)';
                        break;

                    case (_category == 'target' && _reason == 'add-above'):
                        _outline = '#804000';
                        _background = 'rgba(128, 64, 0, 0.5)';
                        break;

                    //  =====

                    case (_category == 'clean-before' && _reason == 'floating'):
                        _outline = '#808080';
                        _background = 'rgba(128, 128, 128, 0.5)';
                        break;

                    case (_category == 'clean-after' && _reason == 'missing-density'):
                        _outline = '#C0C0C0';
                        _background = 'rgba(192, 192, 192, 0.5)';
                        break;

                    case (_category == 'clean-after' || _category == 'clean-before'):
                        _outline = '#000000';
                        _background = 'rgba(0, 0, 0, 0.5)';
                        break;
                }

                //  do
                $(_element).attr('readable__outline', (_category + ': ' + _reason));
                $(_element).css({
                    'outline': '5px solid ' + _outline,
                    'background-color': '' + _background
                });
			};

            $R.debugBackground = function (_element, _category, _reason)
            {
                if ($R.debug); else { return; }

				switch (true)
				{
					case (!(_element.nodeType === 1)):
					case (!(_element.tagName > '')):
					case (_element.tagName.toLowerCase() == 'onject'):
					case (_element.tagName.toLowerCase() == 'embed'):
						//	don't outline
						break;

					default:
						var _color = 'transparent';
						switch (true)
						{
							case (_category == 'target' && _reason == 'first'): 				_color = '';	break;
							case (_category == 'target' && _reason == 'second'): 				_color = '';	break;

							case (_category == 'target' && _reason == 'next-page'):				_color = '#FF80C0'; break;
							case (_category == 'target' && _reason == 'add-above'): 			_color = '#804000'; break;

							case (_category == 'clean-before' && _reason == 'floating'): 		_color = '#808080'; break;
							case (_category == 'clean-after' && _reason == 'missing-density'): 	_color = '#C0C0C0'; break;

							case (_category == 'clean-after' || _category == 'clean-before'):	_color = '#000000'; break;
						}

						$(_element).css('outline','5px solid '+_color);
						$(_element).attr('readable__outline', (_category + ': ' + _reason));
						break;
				}
            };

		//	timers
		//	======
			$R.debugTimerStart = function (timerName)
			{
				$R.debugTimers.push({
					'name': timerName,
					'start': (new Date()).getTime()
				});
			};

			$R.debugTimerEnd = function ()
			{
				var _t = $R.debugTimers.pop(), _time = ((new Date()).getTime() - _t.start);
				$R.log('TIMER / '+_t.name+': ' + _time);
				return _time;
			};

		//	output -- will be shown in Show function
		//	======
			$R.debugPrint = function (_key, _value)
				{ $R.debugStuff[_key] = _value; };

			$R.printDebugOutput = function ()
			{
				//	return
					if ($R.debug); else { return; }
					if ($R.customScript) { return; }

				//	first
					var _first =
					[
                        'Language',
						'ExploreAndGetStuff',
						'ProcessFirst',
						'ProcessSecond',
						'BuildHTML',
						'BuildHTMLPregs',
                        'PointsFirst',
                        'PointsSecond',
                        'Target',
						'NextPage',
                        'TitleSource'
					];

				//	get and clean
					_$debug = $('#debugOutput');
					_$debug.html('');

				//	write
					var _debug_write = function (_key, _value)
					{
						_$debug.append(''
							+ '<tr>'
							+ 	'<td class="caption">'
							+		_key
							+ 	'</td>'
							+ 	'<td id="debugOutput__value__'+_key+'" class="value">'
							+		_value
							+ 	'</td>'
							+ '</tr>'
						);
					}

				//	first
					for (var i=0, _i=_first.length; i<_i; i++)
						{ _debug_write(_first[i], $R.debugStuff[_first[i]]); delete($R.debugStuff[_first[i]]); }

				//	the rest
					for (var _k in $R.debugStuff)
						{ _debug_write(_k, $R.debugStuff[_k]); }

				//	end; stop
					$R.debugPrint = function () {};
					$R.printDebugOutput = function () {};
			};

		//	scriptable scrolling
			$R.debugScroll__before1 = function () { $R.win.scrollTo(0, 0); };
			$R.debugScroll__before2 = function () { $R.win.scrollTo(0, $R.$win.height()); };
			$R.debugScroll__before3 = function () { if ($($R.debugRemember['theTarget']).height() > 0) { $R.debugRemember['theTarget'].scrollIntoView(false); } else { $R.debugRemember['firstCandidate'].scrollIntoView(false); } $R.win.scrollBy(0, 100); };

			$R.debugScroll__after1 = function () { window.scrollTo(0, 0); };
			$R.debugScroll__after2 = function () { window.scrollTo(0, $R.$win.height()); };
			$R.debugScroll__after3 = function () { $('#page1').get(0).scrollIntoView(false); window.scrollBy(0, 100); };
	}


		//	environment
		//	===========

	//	environtment
	//	============

		$R.mac = (!$R.iOS && ($R.win.navigator.userAgent.match(/Macintosh/i) != null));

        //  get browser

//  var -- gets filled in
//  ===
    var __the_browser = 'unknown';


//  possible values -- in this order
//  ===============
/*
    firefox
    safari
    chrome
    internet_explorer
    opera

    iphone
    ipad

    android
    dolphin
    firefox_mobile
    chrome_mobile

    windows_phone
*/


//  doing work
//  ==========
    __the_browser = (function ()
    {
        //  ua string
        //  =========
            var _ua = window.navigator.userAgent.toLowerCase();


        //  cases
        //  =====

            if ((_ua.indexOf('windows phone') > -1))                            { return 'windows_phone'; }

            if ((_ua.indexOf('chrome') > -1) && (_ua.indexOf('android') > -1))  { return 'chrome_mobile'; }
            if ((_ua.indexOf('firefox') > -1) && (_ua.indexOf('fennec') > -1))  { return 'firefox_mobile'; }
            if ((_ua.indexOf('dolfin') > -1) || (_ua.indexOf('dolphin') > -1))  { return 'dolphin'; }
            if ((_ua.indexOf('android') > -1))                                  { return 'android'; }

            if ((_ua.indexOf('ipad') > -1))                                     { return 'ipad'; }
            if ((_ua.indexOf('iphone') > -1))                                   { return 'iphone'; }

            if ($.browser.opera)                                                { return 'opera'; }
            if ($.browser.msie)                                                 { return 'internet_explorer'; }
            if ($.browser.webkit && (_ua.indexOf('chrome') > -1))               { return 'chrome'; }
            if ($.browser.webkit && (_ua.indexOf('safari') > -1))               { return 'safari'; }
            if ($.browser.mozilla)                                              { return 'firefox'; }
    })();
        $R.browser = __the_browser;


    //  language specific stuff
    //  =======================

        //  default
        $R.language = 'general';

        //  text used
        $R.textForlanguageDetection = $R.document.title;

        //  add a couple of random paragraphs, divs
        //  ============
            var  _ps = $R.document.getElementsByTagName('p'), _ds = $R.document.getElementsByTagName('div');
            for (var i=0; i<5; i++) { $R.textForlanguageDetection += ' ' + $(_ps[Math.floor(Math.random()*_ps.length)]).text(); }
            for (var i=0; i<5; i++) { $R.textForlanguageDetection += ' ' + $(_ds[Math.floor(Math.random()*_ds.length)]).text(); }

        //  tidy up
        //  =======
            $R.textForlanguageDetection = $R.textForlanguageDetection.replace(/<([^>]+?)>/gi, '');
            $R.textForlanguageDetection = $R.textForlanguageDetection.replace(/([ \n\r\t]+)/gi, ' ');

        //  check
        //  =====
            switch (true)
            {
                case ($R.textForlanguageDetection.match(/([\u3000])/gi) != null):
                case ($R.textForlanguageDetection.match(/([\u3001])/gi) != null):
                case ($R.textForlanguageDetection.match(/([\u3002])/gi) != null):
                case ($R.textForlanguageDetection.match(/([\u301C])/gi) != null):

                    $R.language = 'cjk';
                    break;
            }

        //  in case we stop
        $R.debugPrint('Language', $R.language);



		//	RUN: outside frame
		//	==================

	(function ()
	{

		var
			_document = $R.document,

			_html = _document.getElementsByTagName('html')[0],
			_html_identifier = (_html.id && _html.id > '' && _html.id.match(/^[a-z]/i) != null ? '#'+_html.id : 'html'),

			_body = _document.getElementsByTagName('body')[0],
			_body_identifier = (_body.id && _body.id > '' && _body.id.match(/^[a-z]/i) != null ? '#'+_body.id : 'body'),

			_cssElement = _document.createElement('style'),

			_cssText = ''

			//	body
			//	====
				+	_html_identifier + '.readableBeforeVisible, '
				+	'html > ' + _body_identifier + '.readableBeforeVisible, '
				+	_body_identifier + '.readableBeforeVisible '
				+	'{ '
				+		'position: static !important; '
				+		'margin: 0 !important; padding: 0 !important; border: 0 !important; '
				+	'} '

				+	_html_identifier + '.readableVisible, '
				+	'html > ' + _body_identifier + '.readableVisible, '
				+	_body_identifier + '.readableVisible '
				+	'{ '
				+		'overflow: hidden !important; overflow-x: hidden !important; overflow-y: hidden !important; '
				+	'} '


			//	objects
			//	=======
				+	_html_identifier + '.readableBeforeVisible object, '
				+	_html_identifier + '.readableBeforeVisible embed, '
				+	_html_identifier + '.readableBeforeVisible iframe, '
				+	'html > ' + _body_identifier + '.readableBeforeVisible object, '
				+	'html > ' + _body_identifier + '.readableBeforeVisible embed, '
				+	'html > ' + _body_identifier + '.readableBeforeVisible iframe, '
				+	_body_identifier + '.readableBeforeVisible object, '
				+	_body_identifier + '.readableBeforeVisible embed, '
				+	_body_identifier + '.readableBeforeVisible iframe '
				+ 	'{ '
				+		'visibility: hidden !important; '
				+	'} '

			//	frame
			//	=====
				+	_html_identifier + '.readableBeforeVisible #readable_iframe, '
				+	'html > ' + _body_identifier + '.readableBeforeVisible #readable_iframe, '
				+	_body_identifier + '.readableBeforeVisible #readable_iframe, '
				+	'#readable_iframe '
				+ 	'{ '
				+		'display: block !important; '
				+		'overflow: auto !important; '
				+		'visibility: visible !important; '
				+	'} '
		;

		//	css
		//	===
			_cssElement.setAttribute('id', 'readableCSS2');
			_cssElement.setAttribute('type', 'text/css');
			if (_cssElement.styleSheet) {_cssElement.styleSheet.cssText = _cssText; }
				else { _cssElement.appendChild(_document.createTextNode(_cssText)); }
			_body.appendChild(_cssElement);


		//	get frame
		//	=========
			$R.$iframe = $R.$document.find('#readable_iframe');

	})();

		//	translations
		//	============

	$R.translations =
	{
		'menu__close__tooltip': 			    'Hide the overlay.',
		'menu__clip_to_evernote__tooltip': 	    'Clip to Evernote[=evernote_account].',
        'menu__highlight_to_evernote__tooltip': 'Highlight.',
		'menu__print__tooltip': 			    'Print.',
		'menu__settings__tooltip': 			    'Show Themes.',
		'menu__fitts__tooltip': 			    'Hide the overlay.',
        'menu__speak__tooltip':                 'Text To Speech',
        'menu__speak__play__tooltip':           'Play',
        'menu__speak__pause__tooltip':          'Pause',
        'menu__speak__forward__tooltip':        'Go Forwards',
        'menu__speak__rewind__tooltip':         'Go Backwards',

		'rtl__main__label': 'Text direction?',
		'rtl__ltr__label': 	'Left-to-right',
		'rtl__rtl__label': 	'Right-to-left',

		'blank_error__heading': 'Tips for using Evernote Clearly',
		'blank_error__body': 	'Clearly is currently designed to work on article pages. An article page is any page that contains one large block of text -- like, for example, a newspaper article or blog post.',

        'related_notes__title':             'Related Notes',
        'related_notes__disable_short':     'Disable?',
        'related_notes__disable_long':      'Do you want to disable Related Notes?',

        'filing_info__title_normal':        'Filed in:',
        'filing_info__title_smart':         'Smart Filed in:',
        'filing_info__default_notebook':    'Default',
        'filing_info__view':                'View',
        'filing_info__edit':                'Edit',
        'filing_info__sentence':            'Clipped into the [=notebook] notebook, and tagged with [=tags].',
        'filing_info__sentence_no_tags':    'Clipped into the [=notebook] notebook.',
        'filing_info__sentence_and':        'and',
        'filing_info__sentence_other_tags': 'other tags',

		'evernote_clipping': 		'Clipping...',
		'evernote_clipping_failed': 'Clipping failed.',

		'evernote_login__heading': 				        'Sign in to Evernote',
		'evernote_login__spinner': 				        'Signing in to Evernote',
		'evernote_login__create_account': 		        'Create an account',
		'evernote_login__button_do__label': 	        'Sign in',
		'evernote_login__button_cancel__label':         'Cancel',

		'evernote_login__username__label': 		        'Evernote Username or Email Address',
		'evernote_login__password__label': 		        'Password',
		'evernote_login__rememberMe__label': 	        'Remember me',

		'evernote_login__username__error__required': 	'Username is required.',
		'evernote_login__username__error__length': 		'Username must be between 1 and 64 characters long.',
		'evernote_login__username__error__format': 		'Username contains bad characters.',
		'evernote_login__username__error__invalid': 	'Not a valid, active user.',

		'evernote_login__password__error__required': 	'Password is required.',
		'evernote_login__password__error__length': 		'Password must be between 6 and 64 characters long.',
		'evernote_login__password__error__format': 		'Password contains bad characters.',
		'evernote_login__password__error__invalid': 	'Username and password do not match existing user.',
		'evernote_login__password__error__timeout': 	'Login session timed-out. Please try again.',

		'evernote_login__password__error__reset': 	    'Your password has expired. Please reset it now.',
		'evernote_login__general__error':               'Authentication failed.',

		'evernote_two_factor__message__sms':            'We sent a text message with a verification code to',
		'evernote_two_factor__message__google':         'Enter the verification code displayed in your Google Authenticator app.',

		'evernote_two_factor__code__label':             'Verification code',
		'evernote_two_factor__code__error__required': 	'Verification code is required.',
		'evernote_two_factor__code__error__length':     'Verification code should be at least 6 characters long.',
		'evernote_two_factor__code__error__format':     'Verification code should be only numbers.',
		'evernote_two_factor__code__error__invalid':    'Verification code is incorrect.',

		'evernote_two_factor__button_do__label': 	    'Verify',
		'evernote_two_factor__button_help__label': 	    'I need help getting a verification code',

		'settings__theme__1__not_translated': 'Newsprint',
		'settings__theme__2__not_translated': 'Notable',
		'settings__theme__3__not_translated': 'Night Owl',

		'settings__theme__1': 'Newsprint',
		'settings__theme__2': 'Notable',
		'settings__theme__3': 'Night Owl',
		'settings__theme__custom': 'Custom',

		'settings__fontSize__small': 'small',
		'settings__fontSize__medium': 'medium',
		'settings__fontSize__large': 'large',

        'features__title__new': 'You have a new version of Evernote Clearly!',
        'features__title__all': 'Welcome to the new Evernote Clearly',

        'features__speech__title':                      'Text To Speech',
        'features__speech__text':                       'Sit back and let Clearly read blog posts, articles, and web pages to you thanks to the new Text To Speech feature, available exclusively for Evernote Premium subscribers.',
        'features__speech__text__powered':              'Evernote Clearly is powered by [=service].',
        'features__speech__text__requires':             'Requires [=product].',
        'features__speech__text__available':            'Text To Speech in 21 languages:',
        'features__speech__text__available_languages':  'English, Japanese, Spanish, French, German, Chinese, Korean, Arabic, Czech, Danish, Dutch, Finnish, Greek, Hungarian, Italian, Norwegian, Polish, Portuguese, Russian, Swedish and Turkish.',
        'features__speech__text__try':                  'Try Text To Speech',
        'features__speech__text__upgrade':              'Upgrade to Evernote Premium',
        'features__speech__text__language':             'Language not supported',
        'features__speech__text__play':                 'Play using this language',
        'features__speech__text__cancel':               'Cancel',
        'features__speech__no_language_title':          'Language not supported',
        'features__speech__no_language_explanation':    'Evernote Clearly was not able to determine the language of this article. If you recognize the language, select it below and we\'ll play it.',

        'features__clipping__title': 'Clip to Evernote',
        'features__clipping__text':  'Save what you\'re reading to your Evernote account with one click. Access clips from any device, anytime in Evernote.',

        'features__highlighting__title': 'Highlighting',
        'features__highlighting__text':  'Highlight text you want to remember & quickly find it in your Evernote account. Highlighting changes you make in Clearly will be updated in your Evernote account automatically.',

        'features__related_notes__title': 'Related Notes',
        'features__related_notes__text':  'Magically rediscover notes from your Evernote account that are related to the page you are viewing. Related Notes are displayed at the bottom of the article or on the right side if space permits.',

        'features__smart_filing__title': 'Smart Filing',
        'features__smart_filing__text':  'Automatically assign tags to your Web clips and saves them to the appropriate notebook, so you don\'t have to.',

        'features__eula_notice':    'By using Clearly, you agree to our [=eula].',
        'features__close2':         'Close',

		'misc__page':	'page'
	};

	//	translate function
	$R.translate = function (_key) {
		return ((_key in $R.translations) ? $R.translations[_key] : _key);
	};


		//	from extension
		//	==============

	//	options
	//	=======
		$R.getFromExtension__options = function ()
		{
			//	include

	//	encode
	//	======
		function __encodeURIComponentForReadable(_string)
		{
			//	none
			if (_string == '') { return 'none'; }

			//	encode
			return encodeURIComponent(_string)
				.replace(/!/g, '%21')
				.replace(/'/g, '%27')
				.replace(/\(/g, '%28')
				.replace(/\)/g, '%29')
				.replace(/\*/g, '%2A')
			;
		}


	//	decode
	//	======
		function __decodeURIComponentForReadable(_string)
		{
			//	none
			if (_string == 'none') { return ''; }

			//	decode
			return decodeURIComponent(_string);
		}




	//	__encodeURIComponentForReadable must be defined

	var __default_options =
	{
		'text_font': 			__encodeURIComponentForReadable('"PT Serif"'),
		'text_font_header': 	__encodeURIComponentForReadable('"PT Serif"'),
		'text_font_monospace': 	__encodeURIComponentForReadable('Inconsolata'),
		'text_size': 			__encodeURIComponentForReadable('16px'),
		'text_line_height': 	__encodeURIComponentForReadable('1.5em'),
		'box_width': 			__encodeURIComponentForReadable('36em'),
		'color_background': 	__encodeURIComponentForReadable('#f3f2ee'),
		'color_text': 			__encodeURIComponentForReadable('#1f0909'),
		'color_links': 			__encodeURIComponentForReadable('#065588'),
		'text_align': 			__encodeURIComponentForReadable('normal'),
		'base': 				__encodeURIComponentForReadable('theme-1'),
		'footnote_links': 		__encodeURIComponentForReadable('on_print'),
		'large_graphics': 		__encodeURIComponentForReadable('do_nothing'),
		'custom_css': 			__encodeURIComponentForReadable('')
	};


			//	do
			$R.options = {};
			for (var _x in __default_options)
			{
				var
					_$element = $R.$document.find('#__readable_option__'+_x),
					_value = _$element.html()
				;

				//	set
				$R.options[_x] = (_value > '' ? _value : __default_options[_x]);
			}
		};


	//	vars
	//	====
		$R.getFromExtension__vars = function ()
		{
			//	include

	//	encode
	//	======
		function __encodeURIComponentForReadable(_string)
		{
			//	none
			if (_string == '') { return 'none'; }

			//	encode
			return encodeURIComponent(_string)
				.replace(/!/g, '%21')
				.replace(/'/g, '%27')
				.replace(/\(/g, '%28')
				.replace(/\)/g, '%29')
				.replace(/\*/g, '%2A')
			;
		}


	//	decode
	//	======
		function __decodeURIComponentForReadable(_string)
		{
			//	none
			if (_string == 'none') { return ''; }

			//	decode
			return decodeURIComponent(_string);
		}




	//	__encodeURIComponentForReadable must be defined

	var __default_vars =
	{
		'theme': 				    __encodeURIComponentForReadable('theme-1'),     /* theme-1, theme-2, theme-3, custom */

		'keys_activation': 		    __encodeURIComponentForReadable('Control + Alt + Right Arrow'),
		'keys_clip': 			    __encodeURIComponentForReadable('Control + Alt + Up Arrow'),
		'keys_highlight': 		    __encodeURIComponentForReadable('Control + Alt + H'),
		'keys_speech': 		        __encodeURIComponentForReadable('Control + Alt + S'),

		'clip_tag': 			    __encodeURIComponentForReadable(''),
		'clip_notebook': 			__encodeURIComponentForReadable(''),
		'clip_notebook_guid': 		__encodeURIComponentForReadable(''),

        'related_notes':            __encodeURIComponentForReadable('enabled'),     /* enabled, just_at_bottom, disabled */
        'smart_filing':             __encodeURIComponentForReadable('enabled'),     /* enabled, just_notebooks, just_tags, disabled */
        'smart_filing_for_business':__encodeURIComponentForReadable('disabled'),    /* enabled, disabled */

		'speech_speed': 			__encodeURIComponentForReadable('normal'),      /* slowest, slow, slower, normal, faster, fast, fastest */
		'speech_gender': 			__encodeURIComponentForReadable('default'),     /* default, female, male */

        'open_notes_in':            __encodeURIComponentForReadable('web'),         /* web, desktop */

		'custom_theme_options':	    __encodeURIComponentForReadable('')             /* the custom theme options get serialized into this */
	};


			//	do
			$R.vars = {};
			for (var _x in __default_vars)
			{
				var
					_$element = $R.$document.find('#__readable_var__'+_x),
					_value = _$element.html()
				;

				//	set
				$R.vars[_x] = __decodeURIComponentForReadable(_value > '' ? _value : __default_vars[_x]);
			}
		};


	//	translations
	//	============
		$R.getFromExtension__translations = function ()
		{
			//	include

	//	encode
	//	======
		function __encodeURIComponentForReadable(_string)
		{
			//	none
			if (_string == '') { return 'none'; }

			//	encode
			return encodeURIComponent(_string)
				.replace(/!/g, '%21')
				.replace(/'/g, '%27')
				.replace(/\(/g, '%28')
				.replace(/\)/g, '%29')
				.replace(/\*/g, '%2A')
			;
		}


	//	decode
	//	======
		function __decodeURIComponentForReadable(_string)
		{
			//	none
			if (_string == 'none') { return ''; }

			//	decode
			return decodeURIComponent(_string);
		}




			for (var _x in $R.translations)
			{
				var
					_$element = $R.$document.find('#__readable_translation__'+_x),
					_value = _$element.html()
				;

				//	set
				if (_value > '') { $R.translations[_x] = __decodeURIComponentForReadable(_value); }
			}
		};



				$R.getFromExtension__translations();
				$R.getFromExtension__vars();
				$R.getFromExtension__options();


		//	RUN: inside frame
		//	================

    (function ()
    {

        //  __escapeForHTML

    //  escapeForHTML
    //  =============
        function __escapeForHTML(_string)
        {
            var _replace = {
                "&": "amp",
                '"': "quot",
                "<": "lt",
                ">": "gt"
            };

            return _string.replace(
                /[&"<>]/g,
                function (_match) { return ("&" + _replace[_match] + ";"); }
            );
        }


        //  create
        $('#bodyContent').html(''

        +	'<div id="curtains">'

+		($R.debug ? ''
+		'<div id="curtain__debug" class="curtain">'
+			'<div class="setBoxWidth"><div class="setBoxWidthInner">'
+				'<div class="curtainCanvas">'
+					'<table id="debugOutput"></table>'
+				'</div>'
+			'</div></div>'
+			'<div class="curtainShading"></div>'
+			'<a href="#" class="curtainCloseButton"></a>'
+		'</div>' : '')

+		'<div id="curtain__tips" class="curtain">'
+			'<div class="setBoxWidth"><div class="setBoxWidthInner">'
+				'<div class="curtainCanvas">'
+					'<div id="curtain__tips__logo"></div>'
+					'<div id="curtain__tips__heading">' + __escapeForHTML($R.translate('blank_error__heading')) + '</div>'
+					'<div id="curtain__tips__body">' + __escapeForHTML($R.translate('blank_error__body')) + '</div>'
+				'</div>'
+			'</div></div>'
+			'<div class="curtainShading"></div>'
+			'<a href="#" class="curtainCloseButton"></a>'
+		'</div>'

+		'<div id="curtain__rtl" class="curtain">'
+			'<div class="setBoxWidth"><div class="setBoxWidthInner">'
+				'<div class="curtainCanvas">'
+					__escapeForHTML($R.translate('rtl__main__label'))
+					'<input  id="curtain__rtl__radio__ltr" type="radio" name="curtain__rtl__radio_input" checked="checked"/>'
+					'<label for="curtain__rtl__radio__ltr">' + __escapeForHTML($R.translate('rtl__ltr__label')) + '</label>'
+					'<input  id="curtain__rtl__radio__rtl" type="radio" name="curtain__rtl__radio_input"/>'
+					'<label for="curtain__rtl__radio__rtl">' + __escapeForHTML($R.translate('rtl__rtl__label')) + '</label>'
+				'</div>'
+			'</div></div>'
+			'<div class="curtainShading"></div>'
+			'<a href="#" class="curtainCloseButton"></a>'
+		'</div>'

        +	'</div>'

        +	'<div id="box">'
        +		'<div id="box_inner">'
        +			'<div id="text">'

        +				'<div id="pages"></div>'
        +				'<ol id="footnotedLinks"></ol>'


        +               '<div id="relatedNotes" class="none empty">' /* bottom / right */
        +                   '<div id="relatedNotes__injected"></div>'
        +                   '<div id="relatedNotes__title">'+__escapeForHTML($R.translate('related_notes__title'))+'</div>'
        +                   '<a id="relatedNotes__close" href="#"></a>'
        +                   '<a id="relatedNotes__disable" href="#">'+__escapeForHTML($R.translate('related_notes__disable_short'))+'</a>'
        +                   '<div id="relatedNotes__first"></div>'
        +                   '<div id="relatedNotes__second"></div>'
    //  +                       '<div class="text"></div>'
    //  +                           '<a class="title"></a>'
    //  +                         //'<a class="date"></a>'
    //  +                           '<a class="snippet"></a>'
    //  +                           '<a class="img" href="" style="background-image: url();"></a>'
        +               '</div>'


        +			'</div>'
        +		'</div>'
        +	'</div>'

        +	'<div id="background"><div id="background_shading"></div></div>'
        +	'<div id="fitts" title="' + __escapeForHTML($R.translate('menu__fitts__tooltip')) + '"></div>'
        +	'<div id="loading"><div id="loading_spinner"></div></div>'
        +	'<div id="dialogs_overlay"></div>'
        +	'<div id="next_pages_container"></div>'
        +	'<div id="audio_elements_container"></div>'

        +	'<div id="blank_error">'
        +		'<table cellspacing="0" cellpadding="0" border="0" id="blank_error__table"><tr><td id="blank_error__td">'
        +			'<div id="blank_error__text">'
        +				'<div id="blank_error__logo"></div>'
        +				'<div id="blank_error__heading">' + __escapeForHTML($R.translate('blank_error__heading')) + '</div>'
        +				'<div id="blank_error__body">' + __escapeForHTML($R.translate('blank_error__body')) + '</div>'
        +			'</div>'
        +		'</td></tr></table>'
        +	'</div>'

        +	'<div id="sidebar">'

+		'<div id="sidebar_menu">'

+			'<a id="sidebar_menu__close" title="' + __escapeForHTML($R.translate('menu__close__tooltip')) + ' (Escape'+(($R.vars && $R.vars['keys_activation'] > '') ? ', ' + __escapeForHTML($R.vars['keys_activation']) : '') + ')' + '" href="#"></a>'

+			'<div id="sidebar_menu__line_above"></div>'

+			'<a id="sidebar_menu__clip_to_evernote" title="' + __escapeForHTML($R.translate('menu__clip_to_evernote__tooltip')) + (($R.vars && $R.vars['keys_clip'] > '') ? ' (' + __escapeForHTML($R.vars['keys_clip']) + ')' : '') + '" href="#"></a>'
+			'<a id="sidebar_menu__clipped_to_evernote" title="' + __escapeForHTML($R.translate('menu__clip_to_evernote__tooltip')) + (($R.vars && $R.vars['keys_clip'] > '') ? ' (' + __escapeForHTML($R.vars['keys_clip']) + ')' : '') + '" href="#"></a>'
+			'<a id="sidebar_menu__clipping_to_evernote" title="' + __escapeForHTML($R.translate('menu__clip_to_evernote__tooltip')) + '" href="#"><div id="sidebar_menu__clipping_to_evernote_spinner"></div></a>'


+			    '<a id="sidebar_menu__highlight_to_evernote" title="' + __escapeForHTML($R.translate('menu__highlight_to_evernote__tooltip')) + (($R.vars && $R.vars['keys_highlight'] > '') ? ' (' + __escapeForHTML($R.vars['keys_highlight']) + ')' : '') + '" href="#"></a>'
+			    '<a id="sidebar_menu__highlighting_to_evernote" title="' + __escapeForHTML($R.translate('menu__highlight_to_evernote__tooltip')) + (($R.vars && $R.vars['keys_highlight'] > '') ? ' (' + __escapeForHTML($R.vars['keys_highlight']) + ')' : '') + '" href="#"></a>'


+			'<a id="sidebar_menu__settings" title="' + __escapeForHTML($R.translate('menu__settings__tooltip')) + '" href="#"></a>'
+			'<a id="sidebar_menu__settings_showing" title="' + __escapeForHTML($R.translate('menu__settings__tooltip')) + '" href="#"></a>'

+			'<a id="sidebar_menu__print" title="' + __escapeForHTML($R.translate('menu__print__tooltip')) + ' ('+($R.mac ? 'Command' : 'Control') + ' P)' + '" href="#"></a>'





+			'<div id="sidebar_menu__line_below"></div>'

+		'</div>'

        +       '<div id="sidebar_dialogs">'


        //	clip info -- smart filing info
        //	=========
+			'<div class="dialog" id="dialog__clip__info"><div class="dialog_canvas theFont">'
+               '<div id="filingInfo_injected"></div>'
+               '<div id="filingInfo_notebook"></div>'
+               '<div id="filingInfo_notebook_default">' + $R.translate('filing_info__default_notebook') + '</div>'
+               '<div id="filingInfo_tags">' + /* <span>tag</span> */ '</div>'

+               '<div id="filingInfo_sentence">' + __escapeForHTML($R.translate('filing_info__sentence')) + '</div>'
+               '<div id="filingInfo_sentence_no_tags">' + __escapeForHTML($R.translate('filing_info__sentence_no_tags')) + '</div>'
+               '<div id="filingInfo_sentence_and">' + __escapeForHTML($R.translate('filing_info__sentence_and')) + '</div>'

+               '<div id="filingInfo_sentence_show"></div>'

+               '<div id="filingInfo_links">'
//+                   '<a id="filingInfo_view" class="dialogButton" href="#url-view" target="_blank">'+ __escapeForHTML($R.translate('filing_info__view')) +'</a>'
+                   '<a id="filingInfo_edit" class="dialogButton" href="#url-edit" target="_blank">'+ __escapeForHTML($R.translate('filing_info__edit')) +'</a>'
+               '</div>'

//+               '<div id="filingInfo__unset_tag"></div>'
+			'</div></div>'


        //	clip failed
        //	===========
+			'<div class="dialog" id="dialog__clip__failed"><div class="dialog_canvas">'
+				'<div id="dialog__clip__failed__icon"></div>'
+				'<div id="dialog__clip__failed__label" class="theFont">' + __escapeForHTML($R.translate('evernote_clipping_failed')) + '</div>'
+			'</div><div class="dialog_cover"></div></div>'


        //	clip login reset
        //	================
+			'<div class="dialog" id="dialog__clip__login_reset"><div class="dialog_canvas">'
+				'<div class="theFont" id="login_reset__message">' + __escapeForHTML($R.translate('evernote_login__password__error__reset')) + '</div>'
+		    	'<input id="login_reset__button" type="button" class="dialogButton theFont" value="Ok"/>'
+			'</div></div>'


        //	clip login
        //	==========
+			'<div class="dialog" id="dialog__clip__login"><div class="dialog_canvas">'


+				    '<iframe class="secureFrame" id="login_frame" name="login_frame" scrolling="no" frameborder="0" src=""></iframe>'

+			'</div></div>'

        //	clip register
        //	=============
+			'<div class="dialog" id="dialog__clip__register"><div class="dialog_canvas">'
+			'</div></div>'

        //  clip done
        //  =========
/*
+			'<div class="dialog" id="dialog__clip__doing"><div class="dialog_canvas">'
+				'<div id="dialog__clip__doing__icon"></div>'
+				'<div id="dialog__clip__doing__label" class="theFont">' + __escapeForHTML($R.translate('evernote_clipping')) + '</div>'
+			'</div><div class="dialog_cover"></div></div>'
*/



                //	settings
                //	========
        +			'<div class="dialog" id="dialog__settings__4"><div class="dialog_canvas">'
        +				'<div id="settings__4">'

        +					'<a id="settings__4__1" class="themeBox">'
        +						'<div class="themeThumbnail"></div>'
        +						'<div class="themeTitle">' + __escapeForHTML($R.translate('settings__theme__1__not_translated')) + '</div>'
        +					'</a>'
        +					'<a id="settings__4__2" class="themeBox">'
        +						'<div class="themeThumbnail"></div>'
        +						'<div class="themeTitle">' + __escapeForHTML($R.translate('settings__theme__2__not_translated')) + '</div>'
        +					'</a>'
        +					'<a id="settings__4__3" class="themeBox">'
        +						'<div class="themeThumbnail"></div>'
        +						'<div class="themeTitle">' + __escapeForHTML($R.translate('settings__theme__3__not_translated')) + '</div>'
        +					'</a>'
        +					'<a id="settings__4__custom" class="themeBox">'
        +						'<div class="themeThumbnail"></div>'
        +						'<div class="themeTitle">' + __escapeForHTML($R.translate('settings__theme__custom')) + '</div>'
        +					'</a>'

        +					'<div id="settings__4__separator" class="settingsSeparator"></div>'

        +					'<div class="fontSizeButtons" id="settings__4__fontSizeButtons">'
        +						'<a id="settings__4__fontSize__small" class="fontSizeButton fontSizeSmall">'
        +							'<div class="fontSizeLabel">' + __escapeForHTML($R.translate('settings__fontSize__small')) + '</div>'
        +						'</a>'
        +						'<a id="settings__4__fontSize__medium" class="fontSizeButton fontSizeMedium">'
        +							'<div class="fontSizeLabel">' + __escapeForHTML($R.translate('settings__fontSize__medium')) + '</div>'
        +						'</a>'
        +						'<a id="settings__4__fontSize__large" class="fontSizeButton fontSizeLarge">'
        +							'<div class="fontSizeLabel">' + __escapeForHTML($R.translate('settings__fontSize__large')) + '</div>'
        +						'</a>'
        +					'</div>'

        +				'</div>'
        +			'</div></div>'

        +	    '</div>'
        +	'</div>'

        +   '<div id="other_dialogs">'

        //  speech show -- show text-to-speech features
        //  ===========



        //  speech language -- language override
        //  ===========



        //  first show eula -- show Clearly features on first run
        //  ===============
+			'<div class="dialog dynamic" id="dialog__eula"><div class="dialog_canvas theFont">'
+               '<div id="dialog__eula__content">'
+                   '<div id="dialog__eula_container">'
                        +    '<h1>End User License Agreement</h1>'

+    '<p>IMPORTANT NOTICE: THIS IS A LEGAL AGREEMENT BETWEEN EVERNOTE AND THE PARTY THAT DOWNLOADS, INSTALLS AND/OR USES THE SOFTWARE PROVIDED BY EVERNOTE, EACH OF WHOM ACCEPTS THE TERMS OF THIS AGREEMENT FOR HERSELF, HIMSELF OR ITSELF (AS APPLICABLE, "LICENSEE"). IF YOU RESIDE IN THE UNITED STATES OR CANADA, THIS CONTRACT WILL BE WITH EVERNOTE CORPORATION, AND, IF YOU RESIDE OUTSIDE OF THE UNITED STATES AND CANADA, THIS CONTRACT WILL BE WITH EVERNOTE GMBH, A WHOLLY-OWNED SUBSIDIARY OF EVERNOTE CORPORATION. (EVERNOTE CORPORATION AND EVERNOTE GMBH, AS APPLICABLE, MAY BE REFERRED TO IN THIS AGREEMENT AS "EVERNOTE"). EVERNOTE SOFTWARE IS LICENSED AND NOT SOLD AND THE RIGHTS TO USE THE SOFTWARE ARE SET FORTH IN THIS AGREEMENT. AS DESCRIBED BELOW, USING THE SOFTWARE ALSO OPERATES AS YOUR CONSENT TO THE TRANSMISSION OF CERTAIN INFORMATION AND DATA DURING ACTIVATION, USE, OBTAINING SOFTWARE UPDATES AND FOR INTERNET-BASED SERVICES.</p>'
+    '<p>CAREFULLY READ THE FOLLOWING TERMS APPLICABLE TO THE LICENSE OF THE EVERNOTE APPLICATION SOFTWARE AND ANY OTHER SOFTWARE PROVIDED TO LICENSEE BY EVERNOTE PURSUANT TO WARRANTY, MAINTENANCE AND SUPPORT OR OTHERWISE, ALL OF WHICH ARE INCLUDED WITHIN THE DEFINITION OF "SOFTWARE" BELOW. THESE TERMS AND CONDITIONS SHALL CONSTITUTE A LEGALLY BINDING AGREEMENT BY AND BETWEEN EVERNOTE AND LICENSEE. LICENSEE\'S ACCEPTANCE ACCORDING TO THE TERMS HEREIN AND/OR LICENSEE\'S INSTALLATION, REPRODUCTION OR USE OF THE SOFTWARE ALSO SIGNIFIES LICENSEE\'S AGREEMENT TO BE LEGALLY BOUND BY THESE TERMS AND CONDITIONS.</p>'
+    '<p>PLEASE NOTE THAT YOU NEED NOT AGREE TO BE BOUND BY THIS AGREEMENT. HOWEVER, IF YOU DO NOT AGREE TO BE LEGALLY BOUND BY THE TERMS AND CONDITIONS SET FORTH HEREIN, YOU ARE NOT PERMITTED TO INSTALL, COPY, USE OR TRANSFER THE SOFTWARE AND SHALL NOT HAVE ANY RIGHTS HEREUNDER AS A "LICENSEE." IF YOU DO NOT AGREE TO BE BOUND BY THIS AGREEMENT, YOU SHOULD PROMPTLY UNINSTALL THE SOFTWARE. NO ADDITIONAL OR CONTRARY TERMS TO THIS AGREEMENT SHALL APPLY UNLESS AGREED TO IN A WRITTEN AGREEMENT BETWEEN LICENSEE AND EVERNOTE.</p>'

+    '<h2>1. DEFINITIONS.</h2>'
+    '<p>For the purposes of this Agreement, the following definitions shall apply:</p>'

+    '<p>1.1 "Derivative Work" means a work that is based upon or derived from the Software, such as a revision, modification, translation, abridgment, condensation or expansion, or any form in which Software may be recast, transformed or adapted, which, if prepared without the express written consent of Evernote, would constitute copyright infringement.</p>'
+    '<p>1.2 "Evernote Service" means the Evernote software service that enables Registered Users to store, organize, search and share text, documents, images and sounds, and upload and sync the same through one or more Certified Device(s).</p>'
+    '<p>1.3 "Evernote Site" means the Internet site(s) published by Evernote and applicable to the Software and/or Evernote Service, as they may change from time to time, including, without limitation, the site which is currently located at www.evernote.com.</p>'
+    '<p>1.4 "Evernote Terms of Service" means the then applicable terms and conditions governing the use of the Evernote Service, as published at the Evernote Site.</p>'
+    '<p>1.5 "Individual Computer" means any general-purpose computing device (desktop, laptop, netbook, tablet, smart phone) that is operated by one human user at a time for that user\'s benefit (e.g., not as a server or in any partition of a computer system). Licensee may access the Software operating on an Individual Computer through a remote device without any additional license.</p>'
+    '<p>1.6 "Object Code" means the form of computer program or portion thereof that can be executed by a computer without further modification.</p>'
+    '<p>1.7 "Registered User" means any individual who has registered at the Evernote Site for either a premium account or free account to use the Evernote Service.</p>'
+    '<p>1.8 "Software" means, collectively, (i) that version of the Evernote application software reflected in text accessed within the Evernote application software, (ii) all updates, upgrades, patches, bug fixes and modifications thereto that may be released by Evernote and made available to Licensee from time to time, if any, in Object Code form and (iii) all written information and materials provided to Licensee with and regarding the Evernote application software, including, without limitation, in the "About" tab or other settings information areas within the particular application (which information may be referred to herein as "Documentation").</p>'
+    '<p>1.9 "Source Code" means the human-readable form of the code and related system documentation for the Software, including all comments and any procedural code such as job control language.</p>'
+    '<p>1.10 "Supported Device" means the type of Individual Computer (e.g., iPad) or the Individual Computer running a certain operating system (e.g., Windows) for which the Software is designed and offered for use. Evernote identifies the Supported Device for the Software by name in connection with the link through which the Software is made available for download or on the written software application description in the materials provided by Evernote with the Software.</p>'


+    '<h2>2. SOFTWARE LICENSES; GENERAL RESTRICTIONS.</h2>'

+    '<h3>2.1 License Grants.</h3>'
+    '<p>(a) Subject to the terms and conditions contained herein, Licensee is hereby granted, and Licensee accepts, a non-exclusive, non-transferable, fully-paid license (i) to install and use the Software on one or more Supported Devices owned or controlled by Licensee and (ii) during such period of time that Licensee is a Registered User, use the Software to enable interaction between the Evernote Service and the Supported Device on which the Software is installed, subject to the Evernote Terms of Service.</p>'
+    '<p>(b) Subject to the terms and conditions contained herein, Evernote hereby grants Licensee a non-exclusive, non-transferable license to make a reasonable number of copies of the Software without modification for Licensee\'s personal use. Licensee agrees that this License Agreement applies to all such copies.</p>'
+    '<p>(c) Certain computer software components licensed by one or more third-parties may be provided with the Software. Evernote grants Licensee a non-exclusive, non-transferable, fully-paid license to use one copy of any third- party software provided by Evernote with the Software ("Third-Party Software") on the terms herein and such terms (if any) as may be set forth in the Documentation (including any additional terms therein), provided that: TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, ALL THIRD-PARTY SOFTWARE IS PROVIDED "AS IS" AND WITH ALL FAULTS. THE PROVISIONS REGARDING DISCLAIMER OF WARRANTIES, EXCLUSION OF CONSEQUENTIAL AND CERTAIN OTHER DAMAGES AND LIMITATION OF LIABILITY IN SECTIONS 6 AND 7 BELOW SHALL APPLY TO SUCH THIRD-PARTY SOFTWARE.</p>'

+    '<h3>2.2 General License Restrictions.</h3>'
+    '<p>Licensee shall only use the Software for Licensee\'s personal use on a Supported Device and, in connection with the Evernote Service, as permitted by the Evernote Terms of Service. Licensee shall not cause or permit the renting, leasing, sublicensing or selling, or any dissemination or other distribution of copies of, the Software by any means or in any form to any person, and shall not permit others to use the Software via a timesharing, outsourcing, service bureau, application service provider, managed service provider or similar arrangement. Licensee may not use the Software in any way that is intended to circumvent the Evernote Terms of Service or to otherwise violate any law or regulation. Licensee shall not use or distribute as a separate or stand alone executable file, product or server any Third-Party Software or use such Third-Party Software except as a component part of the Software. Licensee agrees not to, directly or indirectly, take any action to modify, translate, decompile, reverse engineer, reverse compile, convert to another programming language or otherwise attempt to derive Source Code from the Software or any internal data files generated by the Software, or perform any similar type of operation on any software or firmware acquired under this Agreement, in any fashion or for any purpose whatsoever, except to the extent the foregoing restriction is expressly prohibited by applicable law notwithstanding this limitation. Licensee also acknowledges and agrees any such works are Derivative Works and acknowledges that Evernote retains ownership of the copyright in any Derivative Works and is not granting any right to make, use, publish or distribute any Derivative Works of the Software. Licensee shall not modify or delete any Evernote or thirdparty proprietary rights notices appearing in the Software, or any Third-Party Software, and will implement any changes to such notices, if feasible, that Evernote may reasonably request. Licensee acknowledges and agrees that the technology manifested in the operation of the Software constitutes the valuable trade secrets and know-how of Evernote and its suppliers and, to the extent Licensee discovers any such trade secrets, Licensee will not disclose them to any third party. Licensee acknowledges and agrees that this Agreement in no way shall be construed to provide to Licensee any express or implied license to use or otherwise exploit the Software or any portion thereof except as specifically set forth in this Agreement, and all rights not expressly granted to Licensee are reserved by Evernote. Licensee has no right to transfer any interest in or to any Software, except as permitted by the express terms in this Agreement. The license granted herein is neither contingent on the delivery of any future functionality or features nor dependent on any oral or written public comments made by Evernote regarding future functionality or features.</p>'

+    '<h2>3. OWNERSHIP OF SOFTWARE.</h2>'
+    '<p>Evernote\'s ownership interests in the Software are protected by United States and other applicable copyright, patent and other laws and international treaty provisions. Except for the limited license rights specifically granted to Licensee in this Agreement, all rights, title and interests, including without limitation intellectual property rights, in and to the Software, including all Derivative Works thereof, (and all copies thereof and related materials that are produced or shipped to Licensee under this Agreement), belong to and shall be retained by Evernote or its suppliers, as applicable. Licensee acknowledges that the development of the Software is an ongoing process and that Licensee and other licensees of the Software benefit from the improvements resulting from such ongoing development. In order to facilitate such ongoing development, Licensee may provide certain suggestions, documentation, materials and other data to Evernote regarding the use, improvement or applications of the Software (the "Contributed Ideas"), and Licensee hereby acknowledges and agrees that all Contributed Ideas may be used by Evernote in the development of the Software and/or related products and services. Unless specifically provided in a writing signed by Evernote and Licensee and specifically relating to the disclosure of any Contributed Ideas, and notwithstanding any provision in this Agreement to the contrary, Licensee hereby grants to Evernote the irrevocable, perpetual, nonexclusive, worldwide, royalty-free right and license to disclose, use and incorporate the Contributed Ideas in connection with the development of the Software and/or related products and services, and the demonstration, display, license, reproduction, modification and distribution and sale of the Software and/or related products and services, without any obligation to provide any accounting or other reporting.</p>'

+    '<h2>4. SOFTWARE SUPPORT; INTERACTION WITH EVERNOTE.</h2>'
+    '<p>4.1 Support of Licensee. During the term of this Agreement, Evernote shall use its commercially reasonable efforts to provide technical support of the Software to Licensee according to its then applicable support policies. Such technical support shall be available by email communication in the English language, and any other language that may be available from time to time, during Evernote\'s regular business hours, subject to further restrictions, which may be set forth at the Evernote Site or otherwise published by Evernote and provided or made available to Licensee.</p>'
+    '<p>4.2 Information Sharing and Interactions. During installation of the Software and from time to time thereafter when Licensee uses the Software, the Software will send information about the Software and the Individual Computer on which the Software is installed to Evernote. This information includes the version of the Software, the language of the Software (e.g., English, Japanese, etc.), the Internet protocol address of the Individual Computer and the Individual Computer\'s hardware configuration. Evernote does not use this information to identify personal information regarding Licensee. Evernote does use this information to ensure that Licensee is operating the most current version of the Software and, if there is a newer release of the Software, enable Licensee to download and install the current version appropriate for the Individual Computer. Depending upon the settings in the Software, updates to the Software may be installed automatically without Licensee\'s separate consent. In addition, Evernote will use the information provided to Evernote to enable interaction of the Individual Computer with the Evernote Service, if Licensee is a Registered User. Licensee may customize the interactions with Evernote through the settings found within the Software to limit or, in certain cases, eliminate such interactions. Evernote will use digital certificates to confirm Licensee\'s identity for the purpose of enabling standard encryption of content transmitted between Licensee\'s Individual Computer and the Evernote Service. In an effort to protect the security of such transmissions, Licensee cannot disable the use of such digital certificates in connection with the use of the Evernote Service. By using the Software, Licensee consents to the sharing of the information and interactions described herein and, by using the Software with the Evernote Service, Licensee also consents to the use of information described in the then current Evernote Privacy Policy published at the Evernote Site.</p>'

+    '<h2>5. TERM AND TERMINATION.</h2>'
+    '<p>This Agreement shall commence on the earlier date of delivery or download of the Software, shall be confirmed upon and by the installation of the Software on any computer device and shall continue for so long as Licensee complies with the terms herein, subject to termination or expiration in accordance with the terms provided herein. This Agreement shall automatically terminate, without notice, upon any failure by Licensee to comply with the terms of this Agreement. Upon the termination of this Agreement, all licenses and other rights granted to Licensee hereunder shall immediately terminate. Notwithstanding any termination of this Agreement, the provisions of Sections 3 (Ownership of Software), 6.2 (Disclaimer of Warranties), 7 (Limitations on Liability), 11 (General Provisions) and this Section 5 shall survive and continue to be legally binding upon Licensee and Evernote.</p>'

+    '<h2>6. SOFTWARE WARRANTY AND DISCLAIMER OF WARRANTIES; SOFTWARE WARRANTY REMEDY.</h2>'
+    '<h3>6.1 Limited Warranty.</h3>'
+    '<p>Evernote hereby warrants to Licensee that the Software will perform substantially in accordance with the functional description applicable thereto at the Evernote Site if used in accordance with the terms of this Agreement and any applicable directions or requirements in the Documentation. The foregoing warranty is extended to the initial Licensee only, is not transferable and shall be in effect for thirty (30) days immediately following Licensee\'s receipt of the Software (the "Software Warranty Period"). Licensee\'s sole and exclusive remedy and the entire liability of Evernote and its suppliers and licensors for any breach of this limited warranty will be, at Evernote\'s option, repair or replacement of the Software, if such breach is reported prior to the expiration of the Warranty Period to Evernote or the Evernote authorized distributor that supplied the Software to Licensee (the "Software Warranty Remedy"). Evernote may require that Licensee return or certify the destruction of all copies of the Software to Evernote or to the authorized distributor in order to receive the designated remedy hereunder. Any replacement Software provided pursuant to this Section 6.1 will be covered by the warranty in this Section 6.1 for the remainder of the original Software Warranty Period or for 30 days from the date on which Licensee receives such repaired or replacement Software, whichever is longer.</p>'

+    '<h3>6.2 Disclaimer of Warranties.</h3>'
+    '<p>(a) EXCEPT AS EXPRESSLY PROVIDED IN SECTION 6.1, THE SOFTWARE IS BEING PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND AND EVERNOTE HEREBY DISCLAIMS ALL OTHER WARRANTIES, EXPRESS OR IMPLIED, ORAL OR WRITTEN, WITH RESPECT TO THE SOFTWARE, INCLUDING, WITHOUT LIMITATION, ANY AND ALL IMPLIED WARRANTIES AS TO THE CONDITION, NONINFRINGEMENT, MERCHANTABILITY, DESIGN, OPERATION OR FITNESS FOR ANY PARTICULAR PURPOSE. NO ORAL OR WRITTEN INFORMATION OR ADVICE GIVEN BY EVERNOTE, ITS RESELLERS AND/OR ITS OR THEIR AGENTS OR EMPLOYEES, SHALL CREATE A WARRANTY OR IN ANY WAY INCREASE OR MODIFY THE SCOPE OF THE WARRANTIES EXPRESSLY SET FORTH HEREIN. If Licensee\'s legal jurisdiction provides that a certain implied warranty may not be disclaimed, such implied warranty shall only apply to defects discovered during the period of the express Software Warranty Period provided herein. There is no implied warranty for defects discovered after the expiration of such Software Warranty Period. Some legal jurisdictions do not allow limitations on how long an implied warranty lasts, so these limitations may not apply to Licensee.</p>'
+    '<p>(b) EXCEPT AS EXPRESSLY PROVIDED IN SECTION 6.1, EVERNOTE DOES NOT WARRANT THAT THE SOFTWARE WILL MEET ALL REQUIREMENTS OF LICENSEE, OR THAT THE OPERATION OF THE SOFTWARE WILL BE UNINTERRUPTED OR ERROR FREE, OR THAT ALL SOFTWARE DEFECTS WILL BE CORRECTED. FURTHER, EVERNOTE IS NOT RESPONSIBLE FOR ANY DEFECT OR ERROR RESULTING FROM: (I) THE MODIFICATION, MISUSE OR DAMAGE OF THE SOFTWARE BY PARTIES OTHER THAN EVERNOTE OR PARTIES PERFORMING AS A CONTRACTOR TO, AND AT THE DIRECTION OF, EVERNOTE, (II) LICENSEE\'S FAILURE TO IMPLEMENT ALL BUG FIXES OR OTHER DEFECT CORRECTIONS WHICH ARE MADE AVAILABLE BY EVERNOTE, (III) USE OF THE SOFTWARE IN A MANNER INCONSISTENT WITH THE DIRECTIONS PROVIDED IN THE DOCUMENTATION OR AS PERMITTED BY THIS AGREEMENT, (IV) ANY COMPUTER VIRUS OR (V) ANY DEFECT IN OR FAILURE OF ANY THIRD PARTY\'S INDIVIDUAL COMPUTER, EQUIPMENT, NETWORK OR SOFTWARE, OR FOR ANY USER ERROR. EVERNOTE DOES NOT WARRANT AND SHALL HAVE NO LIABILITY WITH RESPECT TO NON-EVERNOTE PRODUCTS OR SERVICES INCLUDING, WITHOUT LIMITATION, THIRD-PARTY SOFTWARE OR HARDWARE, INTERNET CONNECTIONS OR CONNECTIVITY OR COMPUTER NETWORKS.</p>'

+    '<h2>7. LIMITATIONS ON LIABILITY.</h2>'
+    '<h3>7.1 Consequential Damages.</h3>'
+    '<p>IN NO EVENT SHALL EVERNOTE BE LIABLE TO LICENSEE FOR ANY LOSS OF OR DAMAGE TO DATA OR OTHER PERSONAL OR BUSINESS INFORMATION, LOST PROFITS OR USE OF THE SOFTWARE, OR FOR ANY SPECIAL, INCIDENTAL, INDIRECT OR CONSEQUENTIAL DAMAGES ARISING OUT OF OR IN CONNECTION WITH THIS AGREEMENT, INCLUDING THE INSTALLATION, USE OR PERFORMANCE, OR INABILITY TO USE, THE SOFTWARE, EVEN IF EVERNOTE HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.</p>'

+    '<h3>7.2 Limitation.</h3>'
+    '<p>EVERNOTE PROVIDES THE SOFTWARE AT NO CHARGE TO LICENSEE. IN CONSIDERATION FOR, AND AS A FUNDAMENTAL AND EXPRESS CONDITION OF ENABLING USE OF THE SOFTWARE WITHOUT CHARGE, AND NOTWITHSTANDING ANY PROVISION IN THIS AGREEMENT TO THE CONTRARY, EVERNOTE SHALL NOT HAVE ANY LIABILITY FOR ANY MATTER ARISING OUT OF THE SUBJECT MATTER OF THIS AGREEMENT, WHETHER IN CONTRACT, TORT OR OTHERWISE, EXCEPT THE SOFTWARE WARRANTY REMEDY. THE LIMITATIONS HEREIN SHALL APPLY EVEN IF THE SOFTWARE WARRANTY REMEDY DOES NOT FULLY COMPENSATE LICENSEE FOR ANY OR ALL LOSSES, OR IF EVERNOTE KNEW OR SHOULD HAVE KNOWN ABOUT THE POSSIBILITY OF CONSEQUENTIAL DAMAGES. SOME LEGAL JURISDICTIONS DO NOT ALLOW THE EXCLUSION OR LIMITATION OF INCIDENTAL OR CONSEQUENTIAL DAMAGES, SO THE ABOVE LIMITATION OR EXCLUSION MAY NOT APPLY TO LICENSEE IF LICENSEE RESIDES IN CERTAIN JURISDICTIONS.</p>'

+    '<h2>8. COMPLIANCE WITH EXPORT LAWS.</h2>'
+    '<p>Licensee acknowledges that the Software is subject to laws and regulations of the United States restricting the export thereof to foreign jurisdictions and agrees to comply with all applicable United States and foreign international laws, including, without limitation, the rules and regulations promulgated from time to time by the Bureau of Export Administration, United States Department of Commerce. Without limiting the foregoing, Licensee shall not download, and if downloaded shall not install or shall immediately uninstall and destroy, the Software if Licensee\'s download, installation or use of the Software is prohibited under applicable laws. By installing or using the Software, Licensee agrees to the foregoing and certifies that it is not located in, under the control of, or a national or resident of any country or on any list of countries to which the United States has embargoed goods or on the United States Treasury Department\'s list of Specially Designated Nations or the United States Commerce Department\'s Table of Denial Orders. Licensee shall not export, re-export, transfer or divert directly or indirectly, the Software, Documentation or other information or materials provided hereunder, or the output thereof, to any restricted place or person for which the United States or any other relevant jurisdiction requires any export license or other governmental approval at the time of export without first obtaining such license or approval. Evernote has no responsibility for compliance with such laws and regulations by Licensee. Licensee hereby agrees to indemnify and hold harmless Evernote from and against all claims, losses, damages, liabilities, costs and expenses, including reasonable attorneys\' fees, to the extent such claims arise out of any breach of this Section 8.</p>'

+    '<h2>9. HIGH RISK ACTIVITIES.</h2>'
+    '<p>The Software is not fault-tolerant for, and is not designed or intended for use in, hazardous environments requiring fail-safe performance, including, without limitation, in the operation of nuclear facilities, aircraft navigation or communication systems, air traffic control, weapons systems, direct life-support machines or any other application in which the failure of the Software could lead directly to death, personal injury or severe physical or property damage (collectively, "High Risk Activities"). Evernote expressly disclaims any express or implied warranty of fitness for High Risk Activities.</p>'

+    '<h2>10. UNITED STATES GOVERNMENT.</h2>'
+    '<p>The Software and Documentation are "commercial computer software" and "commercial computer software documentation," respectively, pursuant to DFAR Section 227.7202 and FAR Section 12.212, as applicable. Any use, modification, reproduction, release, performance, display or disclosure of the Software by the United States Government shall be governed solely by the terms of this Agreement, except to the extent expressly permitted by the terms of this Agreement.</p>'

+    '<h2>11. GENERAL PROVISIONS.</h2>'
+    '<h3>11.1 Entire Agreement; Amendment.</h3>'
+    '<p>This Agreement constitutes the entire agreement with regard to the subject matter hereof. No waiver, consent, modification or change of terms of this Agreement shall bind any party unless in writing signed by such party, and then such waiver, consent, modification or change shall be effective only in the specific instance and for the specific purpose given.</p>'

+    '<h3>11.2 Relationship.</h3>'
+    '<p>No agency, partnership, joint venture or employment is created between the parties hereto as a result of this Agreement. Neither party is authorized to create any obligation, expressed or implied, on behalf of the other party, or to exercise any control over the other party\'s methods of operation, except as specifically provided herein.</p>'

+    '<h3>11.3 Governing Law.</h3>'
+    '<p>This Agreement shall be governed by and construed in accordance with the laws of the State of California, United States of America, without regard to its choice of law provisions, and shall not be governed by the provisions of the Convention on Contracts for the International Sale of Goods. If you are provided a translation of this Agreement in a language other than English, such translation is offered as a convenience and, if there is any conflict between such translation and the English language version, the English version of this Agreement shall govern, to the extent not expressly prohibited by the law in your jurisdiction. If you have not received the English version of this Agreement, you may find it at the Evernote Corporation web site (www.evernote.com) or by contacting Evernote and requesting a copy.</p>'

+    '<h3>11.4 Waiver.</h3>'
+    '<p>The waiver by any party hereto of a breach or a default of any provision of this Agreement by another party shall not be construed as a waiver of any succeeding breach of the same or any other provision, nor shall any delay or omission on the part of either party to exercise or avail itself of any right, power or privilege that it has, or may have hereunder, operate as a waiver of any right, power or privilege by such party.</p>'

+    '<h3>11.5 Headings.</h3>'
+    '<p>Captions and headings contained in this Agreement have been included for ease of reference and convenience and shall not be considered in interpreting or construing this Agreement.</p>'

+    '<h3>11.6 Assignment; Successors.</h3>'
+    '<p>The terms and conditions of this Agreement shall inure to the benefit of and be enforceable by the parties hereto and their permitted successors and assigns; provided, that the only permitted successor or assignee shall be a party that acquires all or substantially all of the business and assets of Evernote, whether by merger, sale of assets or otherwise by operation of law. Licensee shall not assign this Agreement or any right, interest or obligation under this Agreement, or in or relating to the Software. Any attempted assignment or delegation in contravention of this provision shall be void and ineffective.</p>'

+    '<h3>11.7 Notices.</h3>'
+    '<p>Any notice or communication from one party to the other required or permitted to be given hereunder shall be in writing and either personally delivered, sent by postal service or sent via courier (with evidence of delivery in any case). All notices shall be in English and shall be effective upon actual receipt, irrespective of the date appearing thereon. Unless otherwise requested, all notices to Evernote shall be to the attention of "Compliance."</p>'

+    '<h3>11.8 Contact.</h3>'
+    '<p>If you have any questions concerning these terms and conditions, you may do so at the following address:</p>'

+    '<table cellspacing="0" cellpadding="5" border="1">'
+        '<tr>'
+            '<th>&nbsp;</th>'
+            '<th>In the USA or Canada</th>'
+            '<th>Outside the USA and Canada</th>'
+        '</tr>'
+        '<tr>'
+            '<th>Mail:</th>'
+            '<td>Evernote Corporation<br />305 Walnut Street<br />Redwood City, CA 94065<br />Attn: General Counsel</td>'
+            '<td>Evernote GmbH<br />Joseffstrasse 59<br />8005, Zurich, Switzerland<br />Attn: Legal Notice</td>'
+        '</tr>'
+        '<tr>'
+            '<th>Email:</th>'
+            '<td>legalnotice@evernote.com</td>'
+            '<td>legalnotice@evernote.com</td>'
+        '</tr>'
+        '<tr>'
+            '<th>Phone:</th>'
+            '<td>650.41.NOTES (650.416.6837)</td>'
+            '<td>+1.650.41.NOTES (650.416.6837)</td>'
+        '</tr>'
+    '</table>'

+    '<p>If you would like to contact Evernote for any other reason relating to use of the Software, you may do so at this address: us-support@evernote.com.</p>'

+                   '</div>'
+                   '<div class="dialog_close" id="dialog__eula__close2_container"><a href="#" class="dialogButton theFont">' + __escapeForHTML($R.translate('features__close2')) + '</a></div>'
+               '</div>'
+               '<a class="dialog_close" href="#"></a>'
+			'<div class="dialog_bottom"></div></div></div>'


        //  first show -- show Clearly features on first run
        //  ==========
+			'<div class="dialog dynamic" id="dialog__features"><div class="dialog_canvas theFont">'
+               '<div id="dialog__features__content">'

+                   '<div class="features_title" id="dialog__features__title__all">' + __escapeForHTML($R.translate('features__title__all')) + '</div>'
+                   '<div class="features_title" id="dialog__features__title__new">' + __escapeForHTML($R.translate('features__title__new')) + '</div>'

+                   '<table id="dialog__features__table" cellspacing="0" cellpadding="0" border="0">'



+                   '<tr id="dialog__features__clipping">'
+                       '<td class="image"><div class="feature_image"></div></td>'
+                       '<td class="text">'
+                           '<div class="feature_title">' + __escapeForHTML($R.translate('features__clipping__title')) + '</div>'
+                           '<div class="feature_text">' + __escapeForHTML($R.translate('features__clipping__text')) + '</div>'
+                      '</td>'
+                   '</tr>'

+                   '<tr id="dialog__features__highlighting">'
+                       '<td class="image"><div class="feature_image"></div></td>'
+                       '<td class="text">'
+                           '<div class="feature_title">' + __escapeForHTML($R.translate('features__highlighting__title')) + '</div>'
+                           '<div class="feature_text">' + __escapeForHTML($R.translate('features__highlighting__text')) + '</div>'
+                      '</td>'
+                   '</tr>'

+                   '<tr id="dialog__features__related_notes">'
+                       '<td class="image"><div class="feature_image"></div></td>'
+                       '<td class="text">'
+                           '<div class="feature_title">' + __escapeForHTML($R.translate('features__related_notes__title')) + '</div>'
+                         '<div class="feature_text">' + __escapeForHTML($R.translate('features__related_notes__text')) + '</div>'
+                       '</td>'
+                   '</tr>'

+                  '<tr id="dialog__features__smart_filing">'
+                       '<td class="image"><div class="feature_image"></div></td>'
+                       '<td class="text">'
+                           '<div class="feature_title">' + __escapeForHTML($R.translate('features__smart_filing__title')) + '</div>'
+                           '<div class="feature_text">' + __escapeForHTML($R.translate('features__smart_filing__text')) + '</div>'
+                       '</td>'
+                   '</tr>'

+                   '</table>'

+                   '<div id="dialog__features__eula_notice">' + __escapeForHTML($R.translate('features__eula_notice')).replace('[=eula]', '<a href="#">End User License Agreement</a>') + '</div>'
+                   '<div class="dialog_close" id="dialog__features__close2_container"><a href="#" class="dialogButton theFont">' + __escapeForHTML($R.translate('features__close2')) + '</a></div>'

+               '</div>'
+               '<a class="dialog_close" href="#"></a>'
+			'<div class="dialog_bottom"></div></div></div>'

        +   '</div>'
        );

        //  speech demo iframe


    })();


	//	cache vars
	//	==========

        $R.$html = $('#html');
        $R.$body = $('#body');

        $R.$box = $('#box');
		$R.$fitts = $('#fitts');
		$R.$background = $('#background');
		$R.$backgroundShading = $('#background_shading');

        $R.$loading = $('#loading');
		$R.$dialogsOverlay = $('#dialogs_overlay');

        $R.$nextPages = $('#next_pages_container');
        $R.$audioElements = $('#audio_elements_container');
		$R.$sidebar = $('#sidebar');
		$R.$sidebarSpeakSection = $('#sidebar_menu__speak_section');

		$R.$text = $('#text');
		$R.$pages = $('#pages');

        $R.$footnotedLinks = $('#footnotedLinks');
        $R.$relatedNotes = $('#relatedNotes');

        $R.$features = $('#dialog__features');


    //  set id
    //  ======
        $R.$body.attr(
            'readable__page_id',
            ''
            + '{' + $R.win.location.hostname + '}'
            + '{' + $R.win.location.pathname + '}'
            + '{' + $R.rand(1, 1000000)      + '}'
        );


		//	options
		//	======

	//	var
	//	===

		//	$R.options holds the options to be applied
		//	$R.appliedOptions holds the options currently applied
		//	_optionsToApply holds the decoded options that will actually be applied
		//	$R.loadedGoogleFonts holds the  currently loaded Google fonts URLs

		$R.appliedOptions = {};
		$R.loadedGoogleFonts = {};

	//	apply options
	//	=============
		$R.applyOptions__fonts = function () {};
		$R.applyOptions = function ()
		{
			//	include defaults
			//	================

	//	encode
	//	======
		function __encodeURIComponentForReadable(_string)
		{
			//	none
			if (_string == '') { return 'none'; }

			//	encode
			return encodeURIComponent(_string)
				.replace(/!/g, '%21')
				.replace(/'/g, '%27')
				.replace(/\(/g, '%28')
				.replace(/\)/g, '%29')
				.replace(/\*/g, '%2A')
			;
		}


	//	decode
	//	======
		function __decodeURIComponentForReadable(_string)
		{
			//	none
			if (_string == 'none') { return ''; }

			//	decode
			return decodeURIComponent(_string);
		}




	//	__encodeURIComponentForReadable must be defined

	var __default_options =
	{
		'text_font': 			__encodeURIComponentForReadable('"PT Serif"'),
		'text_font_header': 	__encodeURIComponentForReadable('"PT Serif"'),
		'text_font_monospace': 	__encodeURIComponentForReadable('Inconsolata'),
		'text_size': 			__encodeURIComponentForReadable('16px'),
		'text_line_height': 	__encodeURIComponentForReadable('1.5em'),
		'box_width': 			__encodeURIComponentForReadable('36em'),
		'color_background': 	__encodeURIComponentForReadable('#f3f2ee'),
		'color_text': 			__encodeURIComponentForReadable('#1f0909'),
		'color_links': 			__encodeURIComponentForReadable('#065588'),
		'text_align': 			__encodeURIComponentForReadable('normal'),
		'base': 				__encodeURIComponentForReadable('theme-1'),
		'footnote_links': 		__encodeURIComponentForReadable('on_print'),
		'large_graphics': 		__encodeURIComponentForReadable('do_nothing'),
		'custom_css': 			__encodeURIComponentForReadable('')
	};


            //  possible options
            //  =================
                var _possible_options = __default_options;

            //  our themes
            //  ==========
                var _ourOwnThemes = '|theme-1|theme-2|theme-3|';


			//	null
			//	====
				if ($R.options); else { $R.options = {}; }

            //  defined
            //  =======
                if ($R.vars && $R.vars['theme'])
                {
                    _possible_options['defined'] = 'custom';
                    $R.options['defined'] = $R.vars['theme'];
                }

            //  blank, invalid
            //  ==============
				for (var _option in _possible_options)
				{
					switch (true)
					{
						case (!(_option in $R.options)):
						case (!($R.options[_option] > '')):
							$R.options[_option] = _possible_options[_option];
							break;
					}
				}

            //  nullify custom css for our own themes
            //  =====================================
                if (_ourOwnThemes.indexOf($R.options['defined']) > -1)
                {
                    $R.options['custom_css'] = '';
                }


			//	what to do
			//	==========

				var
					_resetBase = false,
					_resetOptions = false,
                    _resetDefined = false,
					_optionsToApply = {}
				;

            //  set stuff
            //  =========

				//	_resetBase
				switch (true)
				{
					case (!('base' in  $R.appliedOptions)):
					case (!($R.options['base'] == $R.appliedOptions['base'])):
						_resetBase = true;
						break;
				}

				//	_resetOptions
				for (var _option in _possible_options)
				{
					switch (true)
					{
						case (!(_option in $R.appliedOptions)):
						case (!($R.options[_option] == $R.appliedOptions[_option])):
							_resetOptions = true;
							break;
					}

					//	stop
					if (_resetOptions) { break; }
				}

				//	_resetDefined
				switch (true)
				{
					case (!('defined' in  $R.appliedOptions)):
					case (!($R.options['defined'] == $R.appliedOptions['defined'])):
						_resetDefined = true;
						break;
				}

                //	appliedOptions and optionsToApply
				for (var _option in _possible_options)
				{
					$R.appliedOptions[_option] = $R.options[_option];
					_optionsToApply[_option] = __decodeURIComponentForReadable($R.options[_option]);
				}


			//	apply stuff
			//	===========

                //  base
				if (_resetBase)
				{
					//	remove old
					$('#baseCSS').remove();

					//	add new
					if (_optionsToApply['base'] > '')
					{
						$('head').append(''
							+ '<link id="baseCSS" href="'
							+ $R.paths['main'] + 'css/' + $R.versioning['file_name_base--'+_optionsToApply['base']+'_css']
							+ '" rel="stylesheet" type="text/css" />'
						);
					}
				}

                //	options
				if (_resetOptions)
				{

	function __options__get_css (_options)
	{
		var _cssText = (''
		+	'#body { '
		+		'font-family: [=text_font]; '
		+		'font-size: [=text_size]; '
		+		'line-height: [=text_line_height]; '
		+		'color: [=color_text]; '
		+		'text-align: '+(_options['text_align'] == 'justified' ? 'justify' : 'left')+'; '
		+	'} '

		+	'#background { background-color: [=color_background]; } '

		+	'.setTextColorAsBackgroundColor { background-color: [=color_text]; } '
		+	'.setBackgroundColorAsTextColor { color: [=color_background]; } '

		+	'#box, .setBoxWidth { width: [=box_width]; } '

		+	'a { color: [=color_links]; } '
		+	'a:visited { color: [=color_text]; } '

        +   '#text div.page_duplicateForSpeech #nowSpeaking span { color: [=color_text]; } '
        +   '#text div.page_duplicateForSpeech #nowSpeaking:before { '
        +       'background-color: [=color_links]; '
        +       'opacity: 0.25; '
        +   '} '
     /* +   '#text div.page_duplicateForSpeech #nowSpeaking:before { '
        +       'opacity: 0.25; '
        +       'background-image: linear-gradient(left , [=color_background] 0%, [=color_links] 85%, [=color_background] 100%); '
        +       'background-image: -o-linear-gradient(left , [=color_background] 0%, [=color_links] 85%, [=color_background] 100%); '
        +       'background-image: -moz-linear-gradient(left , [=color_background] 0%, [=color_links] 85%, [=color_background] 100%); '
        +       'background-image: -webkit-linear-gradient(left , [=color_background] 0%, [=color_links] 85%, [=color_background] 100%); '
        +       'background-image: -ms-linear-gradient(left , [=color_background] 0%, [=color_links] 85%, [=color_background] 100%); '
        +       'background-image: -webkit-gradient(linear, left top, right top, color-stop(0.01, [=color_background]), color-stop(0.85, [=color_links]), color-stop(1, [=color_background])); '
        +   '} ' */

        /*
        +   '#text div.page_duplicateForSpeech #nowSpeaking span { color: [=color_background]; } '
        +   '#text div.page_duplicateForSpeech #nowSpeaking:before { background-color: [=color_text]; opacity: 1; } '
        */

		+	'@media print { body.footnote_links__on_print a, body.footnote_links__on_print a:hover { color: [=color_text] !important; text-decoration: none !important; } } '
		+	'body.footnote_links__always a, body.footnote_links__always a:hover { color: [=color_text] !important; text-decoration: none !important; } '

		+	'img { border-color: [=color_text]; } '
		+	'a img { border-color: [=color_links]; } '
		+	'a:visited img { border-color: [=color_text]; } '

		+	'h1 a, h2 a, a h1, a h2 { color: [=color_text]; } '
		+	'h1, h2, h3, h4, h5, h6 { font-family: [=text_font_header]; } '

		+	'pre { background-color: [=color_background]; } '
		+	'pre, code { font-family: [=text_font_monospace]; } '
		+	'hr { border-color: [=color_text]; } '

		+	'#rtl_box { background-color: [=color_text]; color: [=color_background]; } '
		+	'#rtl_box a { color: [=color_background]; } '

		+	'html.rtl #body #text { text-align: ' + (_options['text_align'] == 'justified' ? 'justify' : 'right')+' !important; } '
		+	'h1, h2, h3, h4, h5, h6 { text-align: left; } '
		+	'html.rtl h1, html.rtl h2, html.rtl h3, html.rtl h4, html.rtl h5, html.rtl h6 { text-align: right !important; } '

		+	'[=custom_css] '
		).replace(
			/\[=([a-z_]+?)\]/gi,
			function (_match, _key) { return _options[_key]; }
		);

		return _cssText;
	}
					var _cssText = __options__get_css(_optionsToApply);

					//	remove old
					//	==========
						$('#optionsCSS').remove();

					//	new
					//	===
						var _cssElement = document.createElement('style');
							_cssElement.setAttribute('type', 'text/css');
							_cssElement.setAttribute('id', 'optionsCSS');

						if (_cssElement.styleSheet) { _cssElement.styleSheet.cssText = _cssText; }
							else { _cssElement.appendChild(document.createTextNode(_cssText)); }

						$('head').append(_cssElement);

					//	body classes
					//	============
						$('body')
							.removeClass('footnote_links__on_print footnote_links__always footnote_links__never')
							.removeClass('large_graphics__do_nothing large_graphics__hide_on_print large_graphics__hide_always')
							.addClass('footnote_links__'+_optionsToApply['footnote_links'])
							.addClass('large_graphics__'+_optionsToApply['large_graphics'])
						;
				}

                //	defined
				if (_resetDefined)
				{
					//	remove old
					$('#definedCSS').remove();

					//	add new
					if (_ourOwnThemes.indexOf('|'+_optionsToApply['defined']+'|') > -1)
					{
						$('head').append(''
							+ '<link id="definedCSS" href="'
							+ $R.paths['main'] + 'css/' + $R.versioning['file_name_defined--'+_optionsToApply['defined']+'_css']
							+ '" rel="stylesheet" type="text/css" />'
						);
					}
				}


			//	google fonts
			//	============

				var _fontsFunction = function ()
				{
					//	skip?
					if (_resetOptions); else { return; }

					//	get

	function __options__get_google_fonts (_options)
	{

	var
		__google_fonts_index = {},
		__google_fonts_array =
		[
			'Arvo',
			'Bentham',
			'Cardo',
			'Copse',
			'Corben',
			'Crimson Text',
			'Droid Serif',
			'Goudy Bookletter 1911',
			'Gruppo',
			'IM Fell',
			'Josefin Slab',
			'Kreon',
			'Meddon',
			'Merriweather',
			'Neuton',
			'OFL Sorts Mill Goudy TT',
			'Old Standard TT',
			'Philosopher',
			'PT Serif',
			'Radley',
			'Tinos',
			'Vollkorn',

			'Allerta',
			'Anton',
			'Arimo',
			'Bevan',
			'Buda',
			'Cabin',
			'Cantarell',
			'Coda',
			'Cuprum',
			'Droid Sans',
			'Geo',
			'Josefin Sans',
			'Lato',
			'Lekton',
			'Molengo',
			'Nobile',
			'Orbitron',
			'PT Sans',
			'Puritan',
			'Raleway',
			'Syncopate',
			'Ubuntu',
			'Yanone Kaffeesatz',

			'Anonymous Pro',
			'Cousine',
			'Droid Sans Mono',
			'Inconsolata'
		];

	//	create index
	for (var i=0, ii=__google_fonts_array.length; i<ii; i++){
		__google_fonts_index[__google_fonts_array[i]] = 1;
	}


		var
			_fonts = {},
			_fonts_urls = [],
			_check_font = function (_match, _font)
				{ if (_font in __google_fonts_index) { _fonts[_font] = 1; } }
		;

		//	body
		//	====
			_options['text_font'].replace(/"([^",]+)"/gi, _check_font);
			_options['text_font'].replace(/([^",\s]+)/gi, _check_font);

		//	headers
		//	=======
			_options['text_font_header'].replace(/"([^",]+)"/gi, _check_font);
			_options['text_font_header'].replace(/([^",\s]+)/gi, _check_font);

		//	monospace
		//	=========
			_options['text_font_monospace'].replace(/"([^",]+)"/gi, _check_font);
			_options['text_font_monospace'].replace(/([^",\s]+)/gi, _check_font);

		//	custom css
		//	==========
			_options['custom_css'].replace(/font-family: "([^",]+)"/gi, _check_font);
			_options['custom_css'].replace(/font-family: ([^",\s]+)/gi, _check_font);


		//	return
		//	======

			//	transform to array
			for (var _font in _fonts)
			{
				_fonts_urls.push(''
					+ 'http://fonts.googleapis.com/css?family='
					+ _font.replace(/\s+/g, '+')
					+ ':regular,bold,italic'
				);
			}

			//	return
			return _fonts_urls;
	}

					var _fonts_urls = __options__get_google_fonts(_optionsToApply);

					//	apply
					for (var i=0,_i=_fonts_urls.length; i<_i; i++)
					{
						//	loaded?
						if ($R.loadedGoogleFonts[_fonts_urls[i]]) { continue; }

						//	load
						$('head').append('<link href="'+_fonts_urls[i]+'" rel="stylesheet" type="text/css" />');

						//	mark
						$R.loadedGoogleFonts[_fonts_urls[i]] = 1;
					}
				};

				$R.applyOptions__fonts = function () { _fontsFunction.call(); };
		};


		//	dialogs
		//	=======

	//	vars
	//	====
		$R.openDialogID = false;

	//	show
	//	====
		$R.showDialog = function (_dialog_id)
		{
            //  custom code
            switch (true)
            {
                //  other dialogs
                case (_dialog_id == 'features'):
                case (_dialog_id == 'speech'):
                case (_dialog_id == 'speech_language'):
                case (_dialog_id == 'eula'):

                    var _$dialog = $('#dialog__'+_dialog_id);
                        _$dialog.css({
                            'top': ($(window).scrollTop() + 100) + 'px',
                            'left': ((($R.$background.width() - _$dialog.width()) / 2) - 25) + 'px'
                        });

                    //  steal height for eula
                    if (_dialog_id == 'features')
                    {
                        $('#dialog__eula__content').css({'height': (_$dialog.height() -28 -13 -62) + 'px'});
                        $('#dialog__eula_container').css({'height': (_$dialog.height() -28 -62) + 'px'});
                    }

                    break;

                case (_dialog_id == 'clip__info'):
                    var _sentence_use = ($('#filingInfo_tags span').length > 0 ? $('#filingInfo_sentence').html() : $('#filingInfo_sentence_no_tags').html());

                    //  notebook
                        _sentence_use = _sentence_use.replace('[=notebook]', '<em>' + $('#filingInfo_notebook').html().replace('/ notebook/i', '') + '</em>');

                    //  tags
                        var _tags = $('#filingInfo_tags').html();
                            _tags = _tags.replace(/<\/span>/gi, '</span>, ');
                            _tags = _tags.replace(/<\/span>, $/, '</span>.');
                            _tags = _tags.replace(/<\/span>, <span>([^,]+)<\/span>[.]$/, '</span> ' + $('#filingInfo_sentence_and').html() + ' <span>$1</span>.');
                            _tags = _tags.substr(0, (_tags.length-1));

                        _sentence_use = _sentence_use.replace('[=tags]', _tags);

                    //  show
                    $('#filingInfo_sentence_show').html(_sentence_use);

                    break;
            }

            //  regaular code
			$R.hideOpenDialog();

			$R.$dialogsOverlay.show();
			$('#dialog__'+_dialog_id).show();

            $R.$html.addClass('showing_dialog__'+_dialog_id);

			$R.openDialogID = _dialog_id;
		};

	//	hide
	//	====
		$R.hideDialog = function (_dialog_id)
		{
			$('#dialog__'+_dialog_id).hide();
			$R.$dialogsOverlay.hide();

            $R.$html.removeClass('showing_dialog__'+_dialog_id);

			$R.openDialogID = ($R.openDialogID == _dialog_id ? '' : $R.openDialogID);

            //  specific actions
            switch (true)
            {
                case (_dialog_id == 'speech'):
                    //  pause, if palying
                    var _$p_html = $($R.__speech_demo_document).find('html');
                    if (_$p_html.hasClass('speakPlaying')) { window.$readableForSpeechDemo.speech__doPause(); }
                    break;
            }
		};


	//	hide open
	//	=========
		$R.hideOpenDialog = function ()
		{
			if ($R.openDialogID > ''); else { return; }

			$R.hideDialog($R.openDialogID);

			$R.openDialogID = '';
		};


	//	events
	//	======

		//	overlay hide current
		$R.$dialogsOverlay.click(function ()
		{
			$R.hideOpenDialog();
			return false;
		});

		//	small dialogs -- hide on click
		$('#dialog__clip__failed div.dialog_cover').click(function ()
		{
			$R.hideOpenDialog();
			return false;
		});


	//	curtains
	//	========
		$('#curtains a.curtainCloseButton').click(function(){
			$(this.parentNode).hide();
			return false;
		});



	//	select theme
	//	============
		var __select_theme_from_menu = function (_theme_id)
		{
			//	the themes

	//	encode
	//	======
		function __encodeURIComponentForReadable(_string)
		{
			//	none
			if (_string == '') { return 'none'; }

			//	encode
			return encodeURIComponent(_string)
				.replace(/!/g, '%21')
				.replace(/'/g, '%27')
				.replace(/\(/g, '%28')
				.replace(/\)/g, '%29')
				.replace(/\*/g, '%2A')
			;
		}


	//	decode
	//	======
		function __decodeURIComponentForReadable(_string)
		{
			//	none
			if (_string == 'none') { return ''; }

			//	decode
			return decodeURIComponent(_string);
		}




	//	__encodeURIComponentForReadable must be defined

	var __the_themes =
	{
		'theme-1':
		{
			'text_font': 			__encodeURIComponentForReadable('"PT Serif"'),
			'text_font_header': 	__encodeURIComponentForReadable('"PT Serif"'),
			'text_font_monospace': 	__encodeURIComponentForReadable('Inconsolata'),
			'text_size': 			__encodeURIComponentForReadable('16px'),
			'text_line_height': 	__encodeURIComponentForReadable('1.5em'),
			'box_width': 			__encodeURIComponentForReadable('36em'),
			'color_background': 	__encodeURIComponentForReadable('#f3f2ee'),
			'color_text': 			__encodeURIComponentForReadable('#1f0909'),
			'color_links': 			__encodeURIComponentForReadable('#065588'),
			'text_align': 			__encodeURIComponentForReadable('normal'),
			'base': 				__encodeURIComponentForReadable('theme-1'),
			'footnote_links': 		__encodeURIComponentForReadable('on_print'),
			'large_graphics': 		__encodeURIComponentForReadable('do_nothing'),
			'custom_css': 			__encodeURIComponentForReadable('')
		},

		'theme-2':
		{
			'text_font': 			__encodeURIComponentForReadable('Helvetica, Arial'),
			'text_font_header': 	__encodeURIComponentForReadable('Helvetica, Arial'),
			'text_font_monospace': 	__encodeURIComponentForReadable('"Droid Sans Mono"'),
			'text_size': 			__encodeURIComponentForReadable('14px'),
			'text_line_height': 	__encodeURIComponentForReadable('1.5em'),
			'box_width': 			__encodeURIComponentForReadable('42em'),
			'color_background': 	__encodeURIComponentForReadable('#fff'),
			'color_text': 			__encodeURIComponentForReadable('#333'),
			'color_links': 			__encodeURIComponentForReadable('#090'),
			'text_align': 			__encodeURIComponentForReadable('normal'),
			'base': 				__encodeURIComponentForReadable('theme-2'),
			'footnote_links': 		__encodeURIComponentForReadable('on_print'),
			'large_graphics': 		__encodeURIComponentForReadable('do_nothing'),
			'custom_css': 			__encodeURIComponentForReadable('')
		},

		'theme-3':
		{
			'text_font': 			__encodeURIComponentForReadable('"PT Serif"'),
			'text_font_header': 	__encodeURIComponentForReadable('"PT Serif"'),
			'text_font_monospace': 	__encodeURIComponentForReadable('Inconsolata'),
			'text_size': 			__encodeURIComponentForReadable('16px'),
			'text_line_height': 	__encodeURIComponentForReadable('1.5em'),
			'box_width': 			__encodeURIComponentForReadable('36em'),
			'color_background': 	__encodeURIComponentForReadable('#2d2d2d'),
			'color_text': 			__encodeURIComponentForReadable('#e3e3e3'),
			'color_links': 			__encodeURIComponentForReadable('#e3e3e3'),
			'text_align': 			__encodeURIComponentForReadable('normal'),
			'base': 				__encodeURIComponentForReadable('theme-3'),
			'footnote_links': 		__encodeURIComponentForReadable('on_print'),
			'large_graphics': 		__encodeURIComponentForReadable('do_nothing'),
			'custom_css': 			__encodeURIComponentForReadable('')
		}
	};

			//	set var
			$R.vars['theme'] = _theme_id;
			$R.options['defined'] = _theme_id;

			//	event
			$R.customEvents.dispatchByName('to-extension--select--theme--'+_theme_id);

			//	set theme
			for (var _v in __the_themes[_theme_id])
				{ $R.options[_v] = __the_themes[_theme_id][_v];	}

			//	apply options
			$R.applyOptions();

			//	deselect all -- will be selected for each item
			$('#settings__4 a.themeBox').removeClass('selected');

			//	deselct font size; select medium
			$('#settings__4__fontSizeButtons a.fontSizeButton').removeClass('selected');
			$('#settings__4__fontSize__medium').addClass('selected');
		};

		var __select_theme_from_menu__custom = function ()
		{
			//	the themes

	//	encode
	//	======
		function __encodeURIComponentForReadable(_string)
		{
			//	none
			if (_string == '') { return 'none'; }

			//	encode
			return encodeURIComponent(_string)
				.replace(/!/g, '%21')
				.replace(/'/g, '%27')
				.replace(/\(/g, '%28')
				.replace(/\)/g, '%29')
				.replace(/\*/g, '%2A')
			;
		}


	//	decode
	//	======
		function __decodeURIComponentForReadable(_string)
		{
			//	none
			if (_string == 'none') { return ''; }

			//	decode
			return decodeURIComponent(_string);
		}




	//	__encodeURIComponentForReadable must be defined

	var __the_themes =
	{
		'theme-1':
		{
			'text_font': 			__encodeURIComponentForReadable('"PT Serif"'),
			'text_font_header': 	__encodeURIComponentForReadable('"PT Serif"'),
			'text_font_monospace': 	__encodeURIComponentForReadable('Inconsolata'),
			'text_size': 			__encodeURIComponentForReadable('16px'),
			'text_line_height': 	__encodeURIComponentForReadable('1.5em'),
			'box_width': 			__encodeURIComponentForReadable('36em'),
			'color_background': 	__encodeURIComponentForReadable('#f3f2ee'),
			'color_text': 			__encodeURIComponentForReadable('#1f0909'),
			'color_links': 			__encodeURIComponentForReadable('#065588'),
			'text_align': 			__encodeURIComponentForReadable('normal'),
			'base': 				__encodeURIComponentForReadable('theme-1'),
			'footnote_links': 		__encodeURIComponentForReadable('on_print'),
			'large_graphics': 		__encodeURIComponentForReadable('do_nothing'),
			'custom_css': 			__encodeURIComponentForReadable('')
		},

		'theme-2':
		{
			'text_font': 			__encodeURIComponentForReadable('Helvetica, Arial'),
			'text_font_header': 	__encodeURIComponentForReadable('Helvetica, Arial'),
			'text_font_monospace': 	__encodeURIComponentForReadable('"Droid Sans Mono"'),
			'text_size': 			__encodeURIComponentForReadable('14px'),
			'text_line_height': 	__encodeURIComponentForReadable('1.5em'),
			'box_width': 			__encodeURIComponentForReadable('42em'),
			'color_background': 	__encodeURIComponentForReadable('#fff'),
			'color_text': 			__encodeURIComponentForReadable('#333'),
			'color_links': 			__encodeURIComponentForReadable('#090'),
			'text_align': 			__encodeURIComponentForReadable('normal'),
			'base': 				__encodeURIComponentForReadable('theme-2'),
			'footnote_links': 		__encodeURIComponentForReadable('on_print'),
			'large_graphics': 		__encodeURIComponentForReadable('do_nothing'),
			'custom_css': 			__encodeURIComponentForReadable('')
		},

		'theme-3':
		{
			'text_font': 			__encodeURIComponentForReadable('"PT Serif"'),
			'text_font_header': 	__encodeURIComponentForReadable('"PT Serif"'),
			'text_font_monospace': 	__encodeURIComponentForReadable('Inconsolata'),
			'text_size': 			__encodeURIComponentForReadable('16px'),
			'text_line_height': 	__encodeURIComponentForReadable('1.5em'),
			'box_width': 			__encodeURIComponentForReadable('36em'),
			'color_background': 	__encodeURIComponentForReadable('#2d2d2d'),
			'color_text': 			__encodeURIComponentForReadable('#e3e3e3'),
			'color_links': 			__encodeURIComponentForReadable('#e3e3e3'),
			'text_align': 			__encodeURIComponentForReadable('normal'),
			'base': 				__encodeURIComponentForReadable('theme-3'),
			'footnote_links': 		__encodeURIComponentForReadable('on_print'),
			'large_graphics': 		__encodeURIComponentForReadable('do_nothing'),
			'custom_css': 			__encodeURIComponentForReadable('')
		}
	};

			//	set var
			$R.vars['theme'] = 'custom';
			$R.options['defined'] = 'custom';

			//	event
			$R.customEvents.dispatchByName('to-extension--select--theme--custom');

			//	set theme
			$R.vars['custom_theme_options'].replace
			(
				/\[\[=(.*?)\]\[=(.*?)\]\]/gi,
				function (_match, _name, _value) { $R.options[_name] = _value; }
			);

			//	apply options
			$R.applyOptions();

			//	deselect all -- will be selected for each item
			$('#settings__4 a.themeBox').removeClass('selected');

			//	deselct font size; select medium
			$('#settings__4__fontSizeButtons a.fontSizeButton').removeClass('selected');
		};


	//	select size
	//	===========
		var __select_size_from_menu = function (_size)
		{
			//	the sizes

	//	encode
	//	======
		function __encodeURIComponentForReadable(_string)
		{
			//	none
			if (_string == '') { return 'none'; }

			//	encode
			return encodeURIComponent(_string)
				.replace(/!/g, '%21')
				.replace(/'/g, '%27')
				.replace(/\(/g, '%28')
				.replace(/\)/g, '%29')
				.replace(/\*/g, '%2A')
			;
		}


	//	decode
	//	======
		function __decodeURIComponentForReadable(_string)
		{
			//	none
			if (_string == 'none') { return ''; }

			//	decode
			return decodeURIComponent(_string);
		}




	var __the_sizes =
	{
		'small':
		{
			'theme-1': '12px',
			'theme-2': '12px',
			'theme-3': '12px',
			'custom':  '12px'
		},

		'medium':
		{
			'theme-1': '16px',
			'theme-2': '16px',
			'theme-3': '16px',
			'custom':  '16px'
		},

		'large':
		{
			'theme-1': '20px',
			'theme-2': '20px',
			'theme-3': '20px',
			'custom':  '20px'
		}
	};


			//	event
			$R.customEvents.dispatchByName('to-extension--select--size--'+_size);

			//	apply size
			$R.options['text_size'] = __the_sizes[_size][$R.vars['theme']];
			$R.applyOptions();

			//	deselect all
			//	will be selected for each item
			$('#settings__4__fontSizeButtons a.fontSizeButton').removeClass('selected');
		};


	//	events
	//	======

		//	theme boxes
		$('#settings__4__1').click(function () { __select_theme_from_menu('theme-1'); $('#settings__4__1').addClass('selected'); $R.relatedNotes__doPositioning(); });
		$('#settings__4__2').click(function () { __select_theme_from_menu('theme-2'); $('#settings__4__2').addClass('selected'); $R.relatedNotes__doPositioning(); });
		$('#settings__4__3').click(function () { __select_theme_from_menu('theme-3'); $('#settings__4__3').addClass('selected'); $R.relatedNotes__doPositioning(); });
		$('#settings__4__custom').click(function ()
		{
			//	show settings
				if ($R.vars['custom_theme_options'] > ''); else
				{
					$R.customEvents.dispatchByName('to-extension--open--settings--theme');
					$R.hideOpenDialog();
					return;
				}

			//	apply theme
			//	===========
				__select_theme_from_menu__custom();
				$('#settings__4__custom').addClass('selected');

            //  stuff
            //  =====
                $R.relatedNotes__doPositioning();
		});

		//	size buttons
		$('#settings__4__fontSize__small').click(function ()  { __select_size_from_menu('small');  $('#settings__4__fontSize__small').addClass('selected'); $R.relatedNotes__doPositioning(); });
		$('#settings__4__fontSize__medium').click(function () { __select_size_from_menu('medium'); $('#settings__4__fontSize__medium').addClass('selected'); $R.relatedNotes__doPositioning(); });
		$('#settings__4__fontSize__large').click(function ()  { __select_size_from_menu('large');  $('#settings__4__fontSize__large').addClass('selected'); $R.relatedNotes__doPositioning(); });


	//	initially selected
	//	==================
		(function()
		{
			//	the sizes

	var __the_sizes =
	{
		'small':
		{
			'theme-1': '12px',
			'theme-2': '12px',
			'theme-3': '12px',
			'custom':  '12px'
		},

		'medium':
		{
			'theme-1': '16px',
			'theme-2': '16px',
			'theme-3': '16px',
			'custom':  '16px'
		},

		'large':
		{
			'theme-1': '20px',
			'theme-2': '20px',
			'theme-3': '20px',
			'custom':  '20px'
		}
	};


			//	theme
			switch ($R.vars['theme'])
			{
				case 'theme-1': $('#settings__4__1').addClass('selected'); break;
				case 'theme-2': $('#settings__4__2').addClass('selected'); break;
				case 'theme-3': $('#settings__4__3').addClass('selected'); break;
				case 'custom':  $('#settings__4__custom').addClass('selected'); break;
			}

			//	size
			switch ($R.options['text_size'])
			{
				case __the_sizes['small'][$R.vars['theme']]:  $('#settings__4__fontSize__small').addClass('selected');   break;
				case __the_sizes['medium'][$R.vars['theme']]: $('#settings__4__fontSize__medium').addClass('selected'); break;
				case __the_sizes['large'][$R.vars['theme']]:  $('#settings__4__fontSize__large').addClass('selected');   break;
			}
		})();


		//	menu
		//	====

	//	var
	//	===
		$R.menu_functions = {};


    //  set handlers
    //  ============
        $('#sidebar_menu__close').click(function() {                    return $R.menu_functions['close'](); });
        $('#sidebar_menu__clip_to_evernote').click(function() {         return $R.menu_functions['clip_to_evernote'](); });
        $('#sidebar_menu__clipping_to_evernote').click(function() {     return $R.menu_functions['clipping_to_evernote'](); });
        $('#sidebar_menu__clipped_to_evernote').click(function() {      return $R.menu_functions['clipped_to_evernote'](); });
        $('#sidebar_menu__highlight_to_evernote').click(function() {    return $R.menu_functions['highlight_to_evernote'](); });
        $('#sidebar_menu__highlighting_to_evernote').click(function() { return $R.menu_functions['highlighting_to_evernote'](); });
        $('#sidebar_menu__settings').click(function() {                 return $R.menu_functions['settings'](); });
        $('#sidebar_menu__settings_showing').click(function() {         return $R.menu_functions['settings_showing'](); });
        $('#sidebar_menu__print').click(function() {                    return $R.menu_functions['print'](); });




    //  set functions
    //  =============

        //	general
        //  =======

		$R.menu_functions['close'] = function () { $R.hide(); return false; };

        //	by target -- overriden by boomarklet and extension code
		//  =========

		$R.menu_functions['print'] = function () { $R.hideOpenDialog(); window.print(); return false; };

        $R.menu_functions['settings'] = function () { };
        $R.menu_functions['settings_showing'] = function () { };

		$R.menu_functions['clip_to_evernote'] = function () { };
		$R.menu_functions['clipping_to_evernote'] = function () { };
		$R.menu_functions['clipped_to_evernote'] = function () { };

        $R.menu_functions['highlight_to_evernote'] = function () { };
        $R.menu_functions['highlighting_to_evernote'] = function () { };





    //  setings
    //  =======
        $R.menu_functions['settings_showing'] = function ()
        {
            //  hide dialog
            //  ===========
                $R.hideDialog('settings__4');

            return false;
        };

        $R.menu_functions['settings'] = function ()
        {
            //  show dialog
            //  ===========
                $R.showDialog('settings__4');

            //  track event
            //  ===========
                $R.customEvents.dispatchByName('to-extension--track--theme-popup');

            return false;
        };


    //  clip
    //  ====
        $R.menu_functions['clip_to_evernote'] = function ()
        {
            //	waiting
            //  =======
                //$R.showDialog('clip__doing');
                $R.$html.addClass('clipping');

            //	event
            //  =====
                $R.evernoteLogin__requestedFor = 'clip';
                $R.customEvents.dispatchByName('to-extension--evernote--clip');

            return false;
        };

        $R.menu_functions['clipping_to_evernote'] = function () { return false; };

        $R.menu_functions['clipped_to_evernote'] = function ()
        {
            $R.showDialog('clip__info');
            return false;
        };


    //  highlight
    //  =========
        $R.menu_functions['highlight_to_evernote'] = function ()
        {
            $R.hideOpenDialog();

            $R.highlight__enable();

            var _didSelection = $R.highlight__doCurentSelection();
            if (_didSelection === false); else { $R.highlight__doClip(); }

            return false;
        };

        $R.menu_functions['highlighting_to_evernote'] = function ()
        {
            $R.highlight__disable();

            return false;
        };


    //  speech
    //  ======





		//	custom events
		//	=============

	(function()
	{
		//	include events

	/*
		first three variables will be defined
	*/

	var
		__custom_events__names_to_keys = {},
		__custom_events__keys_to_names = {},
		__custom_events__names_to_objects = {},

		__custom_events =
		[
			['to-extension--open--settings',                                'click-111-111-111-111-1-1-1'],
			['to-extension--open--settings--theme',                         'click-112-112-112-112-1-1-1'],
			['to-extension--open--settings--speech',                        'click-113-113-113-113-1-1-1'],

            ['to-extension--open--premium', 			                    'click-114-114-114-114-1-1-1'],
            ['to-extension--open--password-reset', 			                'click-115-115-115-115-1-1-1'],
            ['to-extension--open--two-factor-help', 			            'click-116-116-116-116-1-1-1'],

            /* === */

			['to-extension--select--theme--theme-1', 			            'click-121-121-121-121-1-1-1'],
			['to-extension--select--theme--theme-2', 				        'click-122-122-122-122-1-1-1'],
			['to-extension--select--theme--theme-3', 		    	        'click-123-123-123-123-1-1-1'],
			['to-extension--select--theme--custom', 	    		        'click-124-124-124-124-1-1-1'],

			['to-extension--select--size--small',     			            'click-125-125-125-125-1-1-1'],
			['to-extension--select--size--medium', 			                'click-126-126-126-126-1-1-1'],
			['to-extension--select--size--large', 		    	            'click-127-127-127-127-1-1-1'],

			['to-extension--select--related-notes--just-at-bottom',         'click-128-128-128-128-1-1-1'],
			['to-extension--select--related-notes--disabled', 		        'click-129-129-129-129-1-1-1'],

            /* === */

			['to-extension--track--view', 			                        'click-131-131-131-131-1-1-1'],
			['to-extension--track--clip', 		    	                    'click-132-132-132-132-1-1-1'],
			['to-extension--track--theme-popup', 			                'click-133-133-133-133-1-1-1'],
			['to-extension--track--settings', 			                    'click-134-134-134-134-1-1-1'],
			['to-extension--track--speech-start', 			                'click-135-135-135-135-1-1-1'],

			['to-extension--track--first-show--check', 			            'click-136-136-136-136-1-1-1'],
			['to-extension--track--first-show--mark', 			            'click-137-137-137-137-1-1-1'],

            /* === */

			['to-extension--evernote--clip', 				                'click-141-141-141-141-1-1-1'],
			['to-extension--evernote--clip-highlights', 		            'click-142-142-142-142-1-1-1'],
			['to-extension--evernote--speech-start', 		                'click-143-143-143-143-1-1-1'],
            ['to-extension--evernote--get-recommendation', 		            'click-144-144-144-144-1-1-1'],

         /* ['to-extension--evernote--get-user', 		                    'click-145-145-145-145-1-1-1'], */
         /* ['to-extension--evernote--unset-tag', 				            'click-146-146-146-146-1-1-1'], */
         /* ['to-extension--evernote--unset-notebook', 		                'click-147-147-147-147-1-1-1'], */

            ['to-extension--evernote--login--do', 				            'click-151-151-151-151-1-1-1'],
            ['to-extension--evernote--login--do-second-factor',             'click-152-152-152-152-1-1-1'],
            ['to-extension--evernote--login--request-load--from-outside',   'click-153-153-153-153-1-1-1'],
			['to-extension--evernote--login--switch-to-cn',                 'click-154-154-154-154-1-1-1'],
            ['to-extension--evernote--login--switch-to-in',                 'click-155-155-155-155-1-1-1'],

             /*
                login--do:
                    triggered by:   frame -- when button is pressed
                    operates in:    background, frame -- gets the username/password from the frame, and performs a background login
                    triggers:       browser...login--successful/failed/failed--username/failed--password/failed--password-reset

                login--do-second-factor:
                    triggered by:   frame -- when button is pressed, in the "enter code" view
                    operates in:    background, frame -- gets the code from the frame, and performs a background completeLogin
                    triggers:       browser...login--successful/failed--second-factor/failed--second-factor-timeout

                login--request-load--from-outside:
                    triggered by:   html -- after clearly has launched; firefox only
                    operates in:    background -- forces the loading of the url into the frame; and then loads everything else too

                login--switch-to-cn/in:
                    triggered by:   frame -- when user clicks on china/international toggle
                    operates in:    background -- switches the background china-mode on/off
                    triggers:       browser...login--set--in/in-cn/cn/cn-in
             */

         /* ['to-extension--evernote--register--do', 				        'click-161-161-161-161-1-1-1'], */
         /* ['to-extension--evernote--register--request-load--from-outside','click-162-162-162-162-1-1-1'], */
		 /*	['to-extension--evernote--register--switch-to-cn',              'click-164-164-164-164-1-1-1'], */
         /* ['to-extension--evernote--register--switch-to-in',              'click-165-165-165-165-1-1-1'], */

            /* ========================================================================================= */

            ['to-browser--evernote--login--show', 		                    'click-211-211-211-211-1-1-1'],
            ['to-browser--evernote--login--show--in-frame', 		        'click-212-212-212-212-1-1-1'],
            ['to-browser--evernote--login--request-second-factor', 		    'click-213-213-213-213-1-1-1'],

            ['to-browser--evernote--login--set--in',                        'click-214-214-214-214-1-1-1'],
            ['to-browser--evernote--login--set--in-cn', 	                'click-215-215-215-215-1-1-1'],
			['to-browser--evernote--login--set--cn', 	                    'click-216-216-216-216-1-1-1'],
            ['to-browser--evernote--login--set--cn-in',  	                'click-217-217-217-217-1-1-1'],

			['to-browser--evernote--login--successful', 		            'click-221-221-221-221-1-1-1'],

			['to-browser--evernote--login--failed', 		    	        'click-222-222-222-222-1-1-1'],
			['to-browser--evernote--login--failed--username',               'click-223-223-223-223-1-1-1'],
			['to-browser--evernote--login--failed--password',               'click-224-224-224-224-1-1-1'],
			['to-browser--evernote--login--failed--password-reset',         'click-225-225-225-225-1-1-1'],

			['to-browser--evernote--login--failed--two-factor--code',       'click-226-226-226-226-1-1-1'],
			['to-browser--evernote--login--failed--two-factor--timeout',    'click-227-227-227-227-1-1-1'],

         /*
            login--show:
                triggered by:   background -- when it detects that login is needed; should be triggered after login-show--in-frame
                operates in:    html -- shows the login dialog

            login--show--in-frame:
                triggered by:   background -- when it detects that login is needed; should be triggered before login-show
                operates in:    frame -- does stuff inside the login frame; like, for example, clear the errors from last time

            login--request-second-factor:
                triggered by:   background -- when it detects that second factor is needed
                operates in:    frame -- does stuff inside the login frame: shows the second-factor view

            login--set--in/in-cn/cn/cn-in:
                triggered by:   background -- after a request has been sent from the frame, the background performs switch, and responds with this event
                operates in:    frame -- switches around the on/off toggles for china/international

            login--failed/failed--username/failed--password
                triggered by:   background -- after the login button was pressed in the frame, it sent an event to the background, which tried to login with the supplied details; the background is now responding with this event
                operates in:    frame -- frame will display the error

            login--failed--password-reset/two-factor
                triggered by:   background -- after the login button was pressed in the frame, it sent an event to the background, which tried to login with the supplied details; the background is now responding with this event
                operates in:    html -- display error dialog for password reset

            login--successful:
                triggered by:   background; same as above
                operates in:    html -- will hide the login dialog, and continue performing whatever operation is was trying to do before
         */

            /* === */

         /* ['to-browser--evernote--register--show', 		                'click-231-231-231-231-1-1-1'], */
         /* ['to-browser--evernote--register--show--in-frame', 		        'click-232-232-232-232-1-1-1'], */

         /* ['to-browser--evernote--register--set--in',                     'click-234-234-234-234-1-1-1'], */
         /* ['to-browser--evernote--register--set--in-cn', 	                'click-235-235-235-235-1-1-1'], */
		 /*	['to-browser--evernote--register--set--cn', 	                'click-236-236-236-236-1-1-1'], */
         /* ['to-browser--evernote--register--set--cn-in',  	            'click-237-237-237-237-1-1-1'], */

		 /*	['to-browser--evernote--register--successful', 		            'click-241-241-241-241-1-1-1'], */
		 /*	['to-browser--evernote--register--failed', 		    	        'click-242-242-242-242-1-1-1'], */

            /* === */

			['to-browser--evernote--clip--successful', 		                'click-251-251-251-251-1-1-1'],
			['to-browser--evernote--clip--failed', 			                'click-252-252-252-252-1-1-1'],

			['to-browser--evernote--clip-highlights--successful',           'click-253-253-253-253-1-1-1'],
			['to-browser--evernote--clip-highlights--failed',               'click-254-254-254-254-1-1-1'],

			['to-browser--evernote--get-recommendation--successful',        'click-255-255-255-255-1-1-1'],
			['to-browser--evernote--get-recommendation--failed',            'click-256-256-256-256-1-1-1'],

            ['to-browser--evernote--speech--go',  		                    'click-257-257-257-257-1-1-1'],

            /* === */

			['to-browser--show--dialog-first--all-features',                'click-261-261-261-261-1-1-1'],
			['to-browser--show--dialog-first--new-features',                'click-262-262-262-262-1-1-1'],

			['to-browser--show--dialog-speech--need-login',                 'click-263-263-263-263-1-1-1'],
			['to-browser--show--dialog-speech--need-premium',               'click-264-264-264-264-1-1-1']
        ]
	;

	for (var i=0,_i=__custom_events.length,e=false,k=false; i<_i; i++)
	{
		e = __custom_events[i];
		k = e[1].split('-');

		__custom_events__names_to_keys[e[0]] = e[1];
		__custom_events__keys_to_names[e[1]] = e[0];
		__custom_events__names_to_objects[e[0]] =
		{
			'_1': k[1],
			'_2': k[2],
			'_3': k[3],
			'_4': k[4],
			'_5': (k[5] == 1 ? true : false),
			'_6': (k[6] == 1 ? true : false),
			'_7': (k[7] == 1 ? true : false)
		};
	}

	var __custom_events__get_key = function (_event)
	{
		return 'click'
			+'-'+_event.screenX
			+'-'+_event.screenY
			+'-'+_event.clientX
			+'-'+_event.clientY
			+'-'+(_event.ctrlKey ? 1 : 0)
			+'-'+(_event.altKey ? 1 : 0)
			+'-'+(_event.shiftKey ? 1 : 0)
		;
	};

	var __custom_events__dispatch = function (_custom_event_object, _document, _window)
	{
		var _e = _document.createEvent("MouseEvents");

		_e.initMouseEvent(
			"click", true, true, _window, 0,
                _custom_event_object['_1'], _custom_event_object['_2'],
                _custom_event_object['_3'], _custom_event_object['_4'],
                _custom_event_object['_5'],
                _custom_event_object['_6'],
                _custom_event_object['_7'],
			false, 0, null
		);

		_document.dispatchEvent(_e);
	};


		//	set custom events
        //  =================
            $R.customEvents = {
                'names_to_keys': __custom_events__names_to_keys,
                'keys_to_names': __custom_events__keys_to_names,
                'names_to_objects': __custom_events__names_to_objects,
                'get_key': __custom_events__get_key,
                'dispatch':  __custom_events__dispatch
            };

        //  send by name -- with this window and document
        //  ============
            $R.customEvents['dispatchByName'] = function (_name)
            {
                $R.customEvents.dispatch(
                    $R.customEvents.names_to_objects[_name],
                    $R.document,
                    $R.win
                );
            };
	})();

	//	listen for events -- on click
	$R.document.addEventListener('click', function(_event)
	{
		var
			_event_key = $R.customEvents.get_key(_event),
			_event_name = $R.customEvents.keys_to_names[_event_key],
			_stop = false
		;

        //  __escapeForHTML

    //  escapeForHTML
    //  =============
        function __escapeForHTML(_string)
        {
            var _replace = {
                "&": "amp",
                '"': "quot",
                "<": "lt",
                ">": "gt"
            };

            return _string.replace(
                /[&"<>]/g,
                function (_match) { return ("&" + _replace[_match] + ";"); }
            );
        }


        //  which event?
		switch (_event_name)
		{
			case 'to-browser--evernote--login--show':

                //  not clipping
                $R.$html.removeClass('clipping');

                //  end highlighting mode
                if ($R.evernoteLogin__requestedFor == 'highlight') { $R.highlight__disable(); }

                //  requested for
                $('#dialog__clip__login').attr('requested_for', $R.evernoteLogin__requestedFor);
                $('#dialog__clip__login_reset').attr('requested_for', $R.evernoteLogin__requestedFor);

				// show login
				$R.showDialog('clip__login');

				//	end
				_stop = true;
				break;


			case 'to-browser--evernote--login--successful':
				//	event
                switch (true)
                {
                    case ($R.evernoteLogin__requestedFor == 'speech'):
                        $R.menu_functions['speak']();
                        break;

                    case ($R.evernoteLogin__requestedFor == 'highlight'):
                        $R.highlight__enable();
                        $R.highlight__doClip();
                        break;

                    case ($R.evernoteLogin__requestedFor == 'clip'):
                    default:
                        $R.menu_functions['clip_to_evernote']();
                        break;
                }

				//	end
				_stop = true;
				break;

			case 'to-browser--evernote--login--failed--password-reset':

				//	show reset password message
				$R.showDialog('clip__login_reset');

				//	end
				_stop = true;
				break;

            /* === */

			case 'to-browser--evernote--clip--successful':
			case 'to-browser--evernote--clip-highlights--successful':
                //  hide login, if open
                $R.hideOpenDialog();

                //  switch classes
                window.setTimeout(
                    function ()
                    {
                        //  clipped
                        //  =======
                            $R.$html.removeClass('clipping').addClass('clipped');

                        //  clip-info
                        //  =========

                            //  only for smart-filing
                            if ($R.vars['smart_filing'] == 'disabled') { return; }

                            //  shown
                            if ($R.showedClipInfo) { return; }

                            //  set
                            $R.showedClipInfo = true;

                            //  show
                            $R.showDialog('clip__info');

                            //  timeout
                            window.setTimeout(function () { $R.hideDialog('clip__info'); }, 5000)
                    },
                    1000
                );

				//	end
				_stop = true;
				break;


			case 'to-browser--evernote--clip--failed':
			case 'to-browser--evernote--clip-highlights--failed':

                //  remove class
                $R.$html.removeClass('clipping');

				//	waiting
				$R.showDialog('clip__failed');

                //  remove all highlights
                $R.highlight__deleteHighlight('all');

				//	end
				_stop = true;
				break;


			case 'to-browser--evernote--get-recommendation--failed':
				//	end
				_stop = true;
				break;

			case 'to-browser--evernote--get-recommendation--successful':
                $R.relatedNotes__doPositioning();
				//	end
				_stop = true;
				break;




            /* === */

			case 'to-browser--show--dialog-first--all-features':
			case 'to-browser--show--dialog-first--new-features':
                //  show
                $R.$features.removeClass('all new');

                switch (_event_name)
                {
                    case 'to-browser--show--dialog-first--all-features': $R.$features.addClass('all'); break;
                    case 'to-browser--show--dialog-first--new-features': $R.$features.addClass('new'); break;
                }

                //  open dialog
                $R.showDialog('features');

                //  event
                $R.customEvents.dispatchByName('to-extension--track--first-show--mark');

                //	end
				_stop = true;
                break;




		}

		if (_stop)
		{
			_event.stopPropagation();
			_event.preventDefault();
		}

	}, true);


        //  related notes
        //  =============
            //  dummy
                $R.relatedNotes__doPositioning = function () {};
            //  override

    //  related notes
    //  =============

        //  resize event
        //  ============
            $R.$win.resize(function () { $R.relatedNotes__doPositioning(true); });


        //  mouse timeouts
        //  ==============

            $R.relatedNotes__first__mouseEnter_timeout = false;
            $R.relatedNotes__first__mouseLeave_timeout = false;

            $R.relatedNotes__second__mouseEnter_timeout = false;
            $R.relatedNotes__second__mouseLeave_timeout = false;


        //  mouse enter
        //  ===========

            $('#relatedNotes__first').on('mouseenter', function () {
                window.clearTimeout($R.relatedNotes__first__mouseLeave_timeout);
                $R.relatedNotes__first__mouseEnter_timeout = window.setTimeout(function ()
                {
                    //$R.$relatedNotes.addClass('undim');
                    $('#relatedNotes__first').animate({'opacity': 0.99}, 350);
                }, 250);
            });

            $('#relatedNotes__second').on('mouseenter', function () {
                window.clearTimeout($R.relatedNotes__second__mouseLeave_timeout);
                $R.relatedNotes__second__mouseEnter_timeout = window.setTimeout(function ()
                {
                    //$R.$relatedNotes.addClass('undim');
                    $('#relatedNotes__second').animate({'opacity': 0.99}, 350);
                }, 250);
            });


        //  mouse leave
        //  ===========

            $('#relatedNotes__first').on('mouseleave', function () {
                window.clearTimeout($R.relatedNotes__first__mouseEnter_timeout);
                $R.relatedNotes__first__mouseLeave_timeout = window.setTimeout(function ()
                {
                    //$R.$relatedNotes.removeClass('undim');
                    $('#relatedNotes__first').animate({'opacity': 0.5}, 350);
                }, 250);
            });

            $('#relatedNotes__second').on('mouseleave', function () {
                window.clearTimeout($R.relatedNotes__second__mouseEnter_timeout);
                $R.relatedNotes__second__mouseLeave_timeout = window.setTimeout(function ()
                {
                    //$R.$relatedNotes.removeClass('undim');
                    $('#relatedNotes__second').animate({'opacity': 0.5}, 350);
                }, 250);
            });


        //  disable
        //  =======
            $('#relatedNotes__disable').click(function ()
            {
                //  do
                $R.vars['related_notes'] = 'disabled';
                $R.customEvents.dispatchByName('to-extension--select--related-notes--disabled');

                //  open settings
                window.setTimeout(function () { $R.customEvents.dispatchByName('to-extension--open--settings'); }, 250);

                //  fade
                $R.$relatedNotes.fadeOut(250, function ()
                {
                    $R.$relatedNotes.get(0).className = 'none';
                    $R.$relatedNotes.attr('style', '');

                    $R.relatedNotes__doPositioning(true);
                });
                return false;
            });


        //  close
        //  =====
            $('#relatedNotes__close').click(function ()
            {
                //  invalid
                if ($R.vars && $R.vars['related_notes']); else { return false; }

                //  move to bottom
                if ($R.vars['related_notes'] == 'enabled')
                {
                    $R.$relatedNotes.fadeOut(250, function ()
                    {
                        $R.$relatedNotes.get(0).className = 'none';
                        $R.$relatedNotes.attr('style', '');

                        $R.vars['related_notes'] = 'just_at_bottom';
                        $R.customEvents.dispatchByName('to-extension--select--related-notes--just-at-bottom');

                        $R.relatedNotes__doPositioning(true);
                    });
                    return false;
                }

                //  disable
                if ($R.vars['related_notes'] == 'just_at_bottom')
                {
                    $('#relatedNotes__disable').show();
                    return false;
                }
            });


        //  positioninng
        //  ============
            $R.relatedNotes__doPositioning = function (_instant)
            {
                //  wait for it
                window.setTimeout(function ()
                {
                    var _relatedNotesClass = false;
                    switch (true)
                    {
                        case (!($R.vars) || ($R.vars && !($R.vars['related_notes']))):
                        case ($R.vars && $R.vars['related_notes'] && ($R.vars['related_notes'] == 'disabled')):
                        case ($R.$relatedNotes.hasClass('empty')):
                            break;

                        case ($R.vars && $R.vars['related_notes'] && ($R.vars['related_notes'] == 'just_at_bottom')):
                            _relatedNotesClass = 'bottom';
                            break;

                        case ($R.vars && $R.vars['related_notes'] && ($R.vars['related_notes'] == 'enabled')):
                            var _diffRight = (($R.$background.width() - 50 - $R.$text.width()) / 2);
                            if (_diffRight > (20 + 290 + 20))
                            {
                                _relatedNotesClass = 'right';

                                var _diffTop = $R.$pages.position().top + $('#articleHeader').innerHeight();

                                $R.$relatedNotes.css({
                                    'right': (((_diffRight-20)*(-1)) + 'px'),
                                    'top':   ((_diffTop) + 'px')
                                });
                            }
                            else
                            {
                                _relatedNotesClass = 'bottom';
                            }
                            break;
                    }

                    //  set
                    if (_relatedNotesClass)
                    {
                        //  reset
                        if (_relatedNotesClass == 'bottom') { $R.$relatedNotes.attr('style', ''); }

                        //  class
                        $R.$relatedNotes.get(0).className = _relatedNotesClass;
                    }
                }, (_instant ? 1 : 1000));
            };


        //  highlighting
        //  ============

    //  global
    //  ======
        $R.highlight = false;


    //  enable / disable
    //  ================

        $R.highlight__enable = function ()
        {
            if ($R.highlight) { return; }

            //  var
            $R.highlight = true;

            //  class
            $R.$html.addClass('highlighting');
        };


        $R.highlight__disable = function ()
        {
            if ($R.highlight); else { return; }

            //  var
            $R.highlight = false;

            //  class
            $R.$html.removeClass('highlighting');
        };


    //  clip with highlights
    //  ====================

        $R.highlight__doClip = function ()
        {
            //  add class
            $R.$html.addClass('clipping');

            //  set for
            $R.evernoteLogin__requestedFor = 'highlight';

            //  send event
            $R.customEvents.dispatchByName('to-extension--evernote--clip-highlights');
        };


    /* include */
    /* ======= */


    //  delete buttons
    //  ==============


        $R.highlight__deleteButton__show = function (_highlight_id) { $('#highlight_delete__' + _highlight_id).fadeIn(250); };
        $R.highlight__deleteButton__hide = function (_highlight_id) { $('#highlight_delete__' + _highlight_id).fadeOut(250); };

        $R.highlight__deleteButton__byId__mouseEnter_timeout = {};
        $R.highlight__deleteButton__byId__mouseLeave_timeout = {};


        $R.$box.on('mouseenter', 'em.highlight', function ()
        {
            var _highlight_id = $(this).attr('highlight_id');

            window.clearTimeout($R.highlight__deleteButton__byId__mouseLeave_timeout[_highlight_id]);

            $R.highlight__deleteButton__byId__mouseEnter_timeout[_highlight_id] = window.setTimeout(
                function ()
                {
                    $R.highlight__deleteButton__byId__mouseEnter_timeout[_highlight_id] = false;
                    $R.highlight__deleteButton__show(_highlight_id);
                },
                250
            );
        });


        $R.$box.on('mouseleave', 'em.highlight', function ()
        {
            var _highlight_id = $(this).attr('highlight_id');

            window.clearTimeout($R.highlight__deleteButton__byId__mouseEnter_timeout[_highlight_id]);

            $R.highlight__deleteButton__byId__mouseLeave_timeout[_highlight_id] = window.setTimeout(
                function ()
                {
                    $R.highlight__deleteButton__byId__mouseLeave_timeout[_highlight_id] = false;
                    $R.highlight__deleteButton__hide(_highlight_id);
                },
                250
            );
        });


        $R.$box.on('click', 'em.highlight a.delete', function ()
        {
            //  get id
            //  ======
                var _id = $(this.parentNode).attr('highlight_id');

            //  remove self
            //  ===========
                $(this).remove();

            //  delete
            //  ======
                $R.highlight__deleteHighlight(_id);

            //  clip
            //  ====
                $R.highlight__doClip()
        });


        $R.highlight__deleteHighlight = function (_highlight_id)
        {
            var
                _expression = 'em.highlight' + (_highlight_id == 'all' ? '' : '[highlight_id="'+_highlight_id+'"]'),
                _parents_to_clean = []
            ;

            //  collection
            $(_expression).each(function (_index, _e)
            {
                //  create
                var _s = document.createElement('span');
                    _s.innerHTML = _e.innerHTML;

                //  do
                _e.parentNode.replaceChild(_s, _e);

                //  parents
                _parents_to_clean.push(_s.parentNode);
            });

            //  delete spans
            $R.highlight__deleteSpansFromParents(_parents_to_clean);
        };


    //  mouse
    //  =====

        $R.highlight__mouseUp_timeout = false;

        $R.highlight__mouseUp = function ()
        {
            //  not in highlight mode
            if ($R.highlight); else { return; }

            //  timeout
            $R.highlight__mouseUp_timeout = window.setTimeout
            (
                function ()
                {
                    $R.highlight__mouseUp_timeout = false;

                    var _didSelection = $R.highlight__doCurentSelection();
                    if (_didSelection === false); else { $R.highlight__doClip(); }
                },
                250
            );
        };

        $R.highlight__mouseDown = function ()
        {
            //  not in highlight mode
            if ($R.highlight); else { return; }

            //  timeout
            window.clearTimeout($R.highlight__mouseUp_timeout);
        };

		$R.$box.mouseup($R.highlight__mouseUp);
		$R.$box.mousedown($R.highlight__mouseDown);
		$R.$background.mouseup($R.highlight__mouseUp);
		$R.$background.mousedown($R.highlight__mouseDown);


    $R.highlight__doCurentSelection = function ()
    {
        //  vars
        //  ====
            var
                _selection = $R.sel.getSelection(window),
                _range = $R.sel.getRange(_selection),
                _text = $R.sel.getRangeText(_range),

                _good_range = (_range ? {
                    'commonAncestorContainer':  _range.commonAncestorContainer,
                    'startContainer':           _range.startContainer,
                    'endContainer':             _range.endContainer,
                    'startOffset':              _range.startOffset,
                    'endOffset':                _range.endOffset
                } : false)
            ;

        //  some exception rules
        //  ====================
            switch (true)
            {
                case (!(_text)):
                case (!(_text.length > 0)):
                case (!(_good_range)):
                    return false;
            }

        //  some corrections
        //  ================

            //  Firefox fucks up -- https://developer.mozilla.org/en/DOM/range.startOffset
            //  Offsets mean two differet things

            //  start container
            if (_good_range.startContainer.nodeType == 1)
            {
                if (_good_range.startContainer.childNodes[_good_range.startOffset])
                {
                    _good_range.startContainer = _good_range.startContainer.childNodes[_good_range.startOffset];
                    _good_range.startOffset = 0;
                }
            }

            //  end container
            if (_good_range.endContainer.nodeType == 1)
            {
                if (_good_range.endContainer.childNodes[_good_range.endOffset])
                {
                    _good_range.endContainer = _good_range.endContainer.childNodes[_good_range.endOffset];
                    _good_range.endOffset = 0;
                }
            }

        //  highlight range
        //  ===============
            var _highlighted_range = $R.highlight__doRange(_good_range);
            if (_highlighted_range === false) { return; }

        //  clear selection
        //  ===============
            try { _selection.removeAllRanges(); } catch (e) {}

        //  correct double highlights
        //  =========================
            var _parents_double_to_clean = [];
            $('em.highlight em.highlight').each(function (_i, _e)
            {
                //  remove inner button
                    $(_e).find('a.delete').remove();

                //  create
                var _newElement = document.createElement('span');
                    _newElement.innerHTML = _e.innerHTML;

                //  repalce
                _e.parentNode.replaceChild(_newElement, _e);

                //  add
                _parents_double_to_clean.push(_newElement.parentNode);
            });

            //  clean
            $R.highlight__deleteSpansFromParents(_parents_double_to_clean);

        //  remove buttons and classes
        //  ==========================
            //  delete buttons
            $('em.highlight a.delete').remove();

            //  first, last
            $('em.highlight.first').removeClass('first');
            $('em.highlight.last').removeClass('last');


        //  add buttons and classes
        //  =======================
            var
                _highlights_collection = $('em.highlight'),
                _highlights_collection_ids = [],
                _curr_delete_button = false
            ;

            //  get all ids
            _highlights_collection.each(function (_i, _e) { _highlights_collection_ids.push($(_e).attr('highlight_id')); });

            //  add button, classes
            _highlights_collection.each(function (_i, _e)
            {
                var
                    _isFirst = (_highlights_collection_ids[(_i-1)] ? (_highlights_collection_ids[_i] != _highlights_collection_ids[(_i-1)]) : true),
                    _isLast = (_highlights_collection_ids[(_i+1)] ? (_highlights_collection_ids[_i] != _highlights_collection_ids[(_i+1)]) : true)
                ;

                if (_isFirst)
                {
                    //  class
                    $(_e).addClass('first');

                    //  create button
                    _curr_delete_button = document.createElement('a');
                    _curr_delete_button.className = 'delete';
                    _curr_delete_button.id = 'highlight_delete__' + _highlights_collection_ids[_i];

                    //  add button
                    _e.insertBefore(_curr_delete_button, _e.firstChild);
                }

                if (_isLast)
                {
                    //  class
                    $(_e).addClass('last');
                }
            });
    };


    $R.highlight__doRange = function (_range_to_highlight)
    {
        //  get referrence elements
        //  =======================
            var
                _commonAncestorElement = $R.highlight__getParentElementOfNode(_range_to_highlight.commonAncestorContainer),
                _startElement = $R.highlight__getParentElementOfNodeWithThisParent(_range_to_highlight.startContainer, _commonAncestorElement),
                _endElement = $R.highlight__getParentElementOfNodeWithThisParent(_range_to_highlight.endContainer, _commonAncestorElement)
            ;


        //  some rules
        //  ==========
            switch (true)
            {
                case ((_startElement.tagName) && (_startElement.tagName.toLowerCase() == 'div') && ($(_startElement).hasClass('page_content') || $(_startElement).hasClass('page_duplicateForSpeech'))):
                case ((_endElement.tagName) && (_endElement.tagName.toLowerCase() == 'div') && ($(_endElement).hasClass('page_content') || $(_endElement).hasClass('page_duplicateForSpeech'))):
                case ((_commonAncestorElement.tagName) && !($.contains($R.$pages.get(0).childNodes[0], _commonAncestorElement) || $.contains($R.$pages.get(0).childNodes[1], _commonAncestorElement))):
                    return false;
            }

            /* $R.log(
                _range.startContainer, _range.endContainer, _range.startOffset, _range.endOffset,
                _range_to_highlight,
                _commonAncestorElement, _startElement, _endElement
            ); */


        //  selection id
        //  ============
            var _selection_id = $R.rand(1, 1000);
            while (true)
            {
                //  nothing found
                if ($('em.highlight[highlight_id="'+_selection_id+'"]').length > 0); else { break; }

                //  new id
                _selection_id = $R.rand(1, 1000);
            }


        //  chainging elements
        //  ==================
            var
                _chaingingElements = [],

                _currElement = _startElement,
                _currChainging = false
            ;

            while (true)
            {
                //  object
                _currChainging = {
                    '_element': _currElement,
                    '_tagName': (_currElement.nodeType === 3 ? '#text' : ((_currElement.nodeType === 1 && _currElement.tagName && _currElement.tagName > '') ? _currElement.tagName.toLowerCase() : '#invalid'))
                };

                //  add
                _chaingingElements.push(_currChainging);

                //  break
                if (_currElement == _endElement) { break; }

                //  next
                _currElement = _currElement.nextSibling;

                //  error?
                if (_currElement); else { break; }
            }


        //  rewrite elements
        //  ================
            var _parents_to_clean = [];
            for (var i=0, _i=_chaingingElements.length, _currElement=false; i<_i; i++)
            {
                var
                    _currElement = _chaingingElements[i],
                    _currNode = _currElement._element,
                    _currTag = _currElement._tagName,
                    _boundry_mode = '',
                    _currBuiltHTML = false,
                    _resNode = false
                ;

                //  get html / mode
                //  ===============
                    switch (true)
                    {
                        case ((_i == 1) && (i == 0)):       _boundry_mode = 'boundry-both';     break;
                        case ((_i > 1) && (i == 0)):        _boundry_mode = 'boundry-start';    break;
                        case ((_i > 1) && (i == (_i-1))):   _boundry_mode = 'boundry-end';      break;
                        default:                            _boundry_mode = 'everything';       break;
                    }

                //  get html
                //  ========
                    _currBuiltHTML = $R.highlight__buildHTMLForElementWithSelectedRange(_currNode, _boundry_mode, _range_to_highlight);


                //  write
                //  =====
                    switch (true)
                    {
                        case ((_currTag == '#text')):

                            //  resulting html might be something like "<em>something</em> something else"
                            //  so we create a dummy span tag to eomcompass it, and then repalce the old text node with that

                            //  create
                            var _newElement = document.createElement('span');
                                _newElement.innerHTML = _currBuiltHTML;

                            //  result
                            _resNode = _newElement;

                            //  replace
                            _currNode.parentNode.replaceChild(_resNode, _currNode);

                            break;

                        case (($R.parsingOptions._elements_self_closing.indexOf('|'+_currTag+'|') > -1)):

                            //  result
                            _resNode = _currNode;

                            /* nothing */ /*
                                var _newElement = document.createElement('em');
                                    _newElement.className = 'highlight';
                                    _newElement.innerHTML = _currBuiltHTML;
                                _currNode.parentNode.replaceChild(_newElement, _currNode);
                            */

                            break;


                        default:

                            //  result
                            _resNode = _currNode;

                            //  innerHTML
                            _currBuiltHTML = _currBuiltHTML.substr((_currBuiltHTML.indexOf('>')+1));
                            _currBuiltHTML = _currBuiltHTML.substr(0, _currBuiltHTML.lastIndexOf('<'));

                            //  highlighted anything?
                            if (_currBuiltHTML.indexOf('<em class="highlight">') > - 1); else { break; }

                            //  do it
                            _currNode.innerHTML = _currBuiltHTML;
                            break;
                    }


                //  set highlight class
                //  ===================

                    //  inside node
                    $(_resNode).find('em.highlight:not([highlight_id])').attr('highlight_id', _selection_id);

                    //  on node
                    if ((_currTag == 'em') && $(_resNode).hasClass('highlight'))
                        { $(_resNode).attr('highlight_id', _selection_id); }

                    //  clean::add
                    _parents_to_clean.push(_resNode.parentNode);
            }

            //  clean::do
            $R.highlight__deleteSpansFromParents(_parents_to_clean);
    };


    $R.highlight__deleteSpansFromParents = function (_parents)
    {
        var
            _done = [],
            _this_done = false,
            _inner = ''
        ;

        //  main loop
        for (var i=0, _i=_parents.length; i<_i; i++)
        {
            //  init
            _this_done = false;

            //  check
            for (var ii=0, _ii=_done.length; ii<_ii; ii++)
            {
                if (_done[ii] == _parents[i])
                {
                    _this_done = true;
                    break;
                }
            }

            //  skip
            if (_this_done) { continue; }


            //  actually do
            //  ===========

                //  add
                _done.push(_parents[i]);

                //  get
                _inner = _parents[i].innerHTML;

                //  check
                if (_inner.indexOf('<span') > -1); else { continue; }

                //  replace
                _inner = _inner.replace(/<span([^>]*?)>/gi, '');
                _inner = _inner.replace(/<\/span>/gi, '');
                _parents[i].innerHTML = _inner;
        }
    };


    $R.highlight__getDeepestTextNode = function (_node)
    {
        var _n = _node;

        while (true)
        {
            switch (true)
            {
                //  text
                case (_n.nodeType && _n.nodeType == 3): return _n;

                //  single child
                case (_n.nodeType && _n.nodeType == 1 && _n.childNodes.length > 0): _n = _n.childNodes[0]; break;

                //  no children but has sibling
                case (_n.nodeType && _n.nodeType == 1 && _n.childNodes.length == 0 && _n.nextSibling): _n = _n.nextSibling; break;

                //  default
                default: return _node;
            }
        }
    };


    $R.highlight__getCommonAncestorContainerForNodes = function (_node1, _node2, _fallback)
    {
        var
            _parent1 = _node1,
            _parent2 = _node2
        ;

        while (true)
        {
            //  next
            _parent1 = _parent1.parentNode;
            _parent2 = _parent2.parentNode;

            //  break
            switch (true)
            {
                case (!(_parent1)):
                case (!(_parent2)):
                case (_parent1 == _fallback):
                case (_parent2 == _fallback):
                    return _fallback;
            }

            //  maybe
            switch (true)
            {
                case (_parent1 == _parent2): return _parent1;

                case ($.contains(_parent1, _node2)): return _parent1;
                case ($.contains(_parent2, _node1)): return _parent2;

                case ($.contains(_parent1, _parent2)): return _parent1;
                case ($.contains(_parent2, _parent1)): return _parent2;
            }
        }
    };


    $R.highlight__getParentElementOfNode = function (_thisNode)
    {
        var _element = _thisNode;
        while (true) {
            //  correct
            if (_element.nodeType == 1) { break; }

            //  continue
            _element = _element.parentNode;
        }
        return _element;
    };


    $R.highlight__getParentElementOfNodeWithThisParent = function (_thisNode, _thisParent)
    {
        //  impossible
        switch (true)
        {
            case (_thisNode == _thisParent):
                return _thisNode;

            case (!($.contains(_thisParent, _thisNode))):
                return _thisNode;
        }

        //  do
        var _element = _thisNode;
        while (true) {
            //  correct
            if (_element.parentNode == _thisParent) { break; }

            //  continue
            _element = _element.parentNode;
        }
        return _element;
    };


    $R.highlight__buildHTMLForElementWithSelectedRange = function (_elementToBuildHTMLFor, _modeToBuildHTMLIn, _rangeToBuildHTMLWith)
    {
        var
            _global__element_index = 0,
            _global__the_html = '',
            _global__highlight_on = ((_modeToBuildHTMLIn == 'boundry-end') ? true : false)
        ;

        //	recursive function
        //	==================
        var _recursive = function (_node)
        {
            //	increment index -- starts with 1
            //	===============
                _global__element_index++;

            //	vars
            //	====
                var
                    _explored = false,
                    _tag_name = (_node.nodeType === 3 ? '#text' : ((_node.nodeType === 1 && _node.tagName && _node.tagName > '') ? _node.tagName.toLowerCase() : '#invalid')),
                    _tag_is_ignored = ($R.parsingOptions._elements_ignore_tag.indexOf('|'+_tag_name+'|') > -1),
                    _tag_is_ignored = (_tag_is_ignored ? ((_tag_name == 'span') ? false : true) : false),
                    _pos__start__before = 0,
                    _pos__start__after = 0,
                    _pos__end__before = 0,
                    _pos__end__after = 0,
                    _to_write = '',
                    _selection_starts_here = false,
                    _selection_ends_here = false
                ;

            //	fast return
            //	===========
                switch (true)
                {
                    case ((_tag_name == '#invalid')):
                    case (($R.parsingOptions._elements_ignore.indexOf('|'+_tag_name+'|') > -1)):
                        return;

                    case (_tag_name == '#text'):
                        //  get value
                        //  =========
                            _to_write = _node.nodeValue.replace(/</gi, '&lt;').replace(/>/gi, '&gt;');

                        //  mode?
                        //  =====
                            switch (true)
                            {
                                case (_modeToBuildHTMLIn == 'nothing'):
                                    break;

                                case (_modeToBuildHTMLIn == 'everything'):
                                    _to_write = ''
                                        + '<highlight>'
                                        +   _to_write
                                        + '</highlight>'
                                    ;
                                    break;

                                case (_modeToBuildHTMLIn == 'boundry-start'):
                                case (_modeToBuildHTMLIn == 'boundry-end'):
                                case (_modeToBuildHTMLIn == 'boundry-both'):

                                    //  end of range?
                                    //  =============
                                        if (_node == _rangeToBuildHTMLWith.endContainer)
                                        {
                                            _to_write = ''
                                                + '<highlight>'
                                                +   _to_write.substr(0, _rangeToBuildHTMLWith.endOffset)
                                                + '</highlight>'
                                                + _to_write.substr(_rangeToBuildHTMLWith.endOffset)
                                            ;

                                            _global__highlight_on = false;
                                            _selection_ends_here = true;
                                        }

                                    //  start of range?
                                    //  ===============
                                        if (_node == _rangeToBuildHTMLWith.startContainer)
                                        {
                                            _to_write = ''
                                                + _to_write.substr(0, _rangeToBuildHTMLWith.startOffset)
                                                + '<highlight>'
                                                +   _to_write.substr(_rangeToBuildHTMLWith.startOffset)
                                                + '</highlight>'
                                            ;

                                            _global__highlight_on = true;
                                            _selection_starts_here = true;
                                        }

                                    //  correction
                                    //  ==========
                                        if (_selection_starts_here && _selection_ends_here)
                                        {
                                            _to_write = _node.nodeValue.replace(/</gi, '&lt;').replace(/>/gi, '&gt;');
                                            _to_write = ''
                                                + _to_write.substr(0, _rangeToBuildHTMLWith.startOffset)
                                                + '<highlight>'
                                                +   _to_write.substr(_rangeToBuildHTMLWith.startOffset, (_rangeToBuildHTMLWith.endOffset - _rangeToBuildHTMLWith.startOffset))
                                                + '</highlight>'
                                                + _to_write.substr(_rangeToBuildHTMLWith.endOffset)
                                            ;

                                            _global__highlight_on = false;
                                        }

                                    //  snap-to
                                    //  =======
                                        if (_selection_starts_here && (_rangeToBuildHTMLWith.startOffset > 0))
                                        {
                                            //  before
                                            _to_write = _to_write.replace(/([ .,;?!])([a-z0-9]{1,2})<highlight>/gi, '$1<highlight>$2');

                                            //  space at begining
                                            _to_write = _to_write.replace(/<highlight>([\s])([^\s])/gi, '$1<highlight>$2');

                                            //  too much
                                            _to_write = _to_write.replace(/<highlight>([a-z0-9])([ ])([a-z0-9])/gi, '$1$2<highlight>$3');
                                        }

                                        if (_selection_ends_here && (_rangeToBuildHTMLWith.endOffset > 0))
                                        {
                                            var _do_end = true;

                                            if (_rangeToBuildHTMLWith.endContainer && _rangeToBuildHTMLWith.endContainer.nodeValue && _rangeToBuildHTMLWith.endContainer.nodeValue.length)
                                                { _do_end = (_rangeToBuildHTMLWith.endOffset < _rangeToBuildHTMLWith.endContainer.nodeValue.length); }

                                            if (_do_end)
                                            {
                                                //  after
                                                _to_write = _to_write.replace(/<\/highlight>([a-z0-9]{0,2})([ .,;?!])/gi, '$1$2</highlight>');

                                                //  space at end
                                                _to_write = _to_write.replace(/([^\s])([\s])<\/highlight>/gi, '$1</highlight>$2');

                                                //  too much
                                                _to_write = _to_write.replace(/([ ])([a-z0-9])<\/highlight>([a-z0-9])/gi, '</highlight>$1$2$3');
                                            }
                                        }

                                    //  other
                                    //  =====
                                        if (!(_selection_starts_here) && !(_selection_ends_here))
                                        {
                                            _to_write = _node.nodeValue.replace(/</gi, '&lt;').replace(/>/gi, '&gt;');
                                            if (_global__highlight_on)
                                            {
                                                _to_write = ''
                                                    + '<highlight>'
                                                    +   _to_write
                                                    + '</highlight>'
                                                ;
                                            }
                                        }

                                    break;
                            }

                        //  write value
                        //  ===========
                            _global__the_html += _to_write;

                        return;
                }


            //  range anchors are elements instead of text-nodes
            //  ================================================

                //  end of range?
                if ((_rangeToBuildHTMLWith.endContainer.nodeType == 1) && (_node == _rangeToBuildHTMLWith.endContainer)) {
                    _global__highlight_on = false;
                    _selection_ends_here = true;
                }

                //  start of range?
                if ((_rangeToBuildHTMLWith.startContainer.nodeType == 1) && (_node == _rangeToBuildHTMLWith.startContainer)) {
                    _global__highlight_on = true;
                    _selection_starts_here = true;
                }

                //  correction
                if (_selection_starts_here && _selection_ends_here) {
                    _global__highlight_on = false;
                }


            //	start tag
            //	=========
                if (_tag_is_ignored); else
                {
                    /* mark */	_pos__start__before = _global__the_html.length;
                    /* add */	_global__the_html += '<'+_tag_name;

                    //	attributes
                    //	==========

	//	allowed attributes
	//	==================
		if (_tag_name in $R.parsingOptions._elements_keep_attributes)
		{
			for (var i=0, _i=$R.parsingOptions._elements_keep_attributes[_tag_name].length; i<_i; i++)
			{
				var
					_attribute_name = $R.parsingOptions._elements_keep_attributes[_tag_name][i],
					_attribute_value = _node.getAttribute(_attribute_name)
				;

				//	if present
				if (_attribute_value > '')
					{ _global__the_html += ' '+_attribute_name+'="'+(_attribute_value)+'"'; }
			}
		}

	//	keep ID for all elements
	//	========================
		var _id_attribute = _node.getAttribute('id');
		if (_id_attribute > '')
			{ _global__the_html += ' id="'+_id_attribute+'"'; }

	//	links target NEW
	//	================
		if (_tag_name == 'a')
			{ _global__the_html += ' target="_blank"'; }


                    //  add class name
                    //  ==============
                        var _class_attribute = _node.getAttribute('class');
                        if (_class_attribute > '')
                            { _global__the_html += ' class="'+_class_attribute+'"'; }

                    //  add highlight id -- for EMs that are outside the global highlight
                    //  ================
                        if (_tag_name == 'em' && _modeToBuildHTMLIn != 'everything')
                        {
                            //  with a fix for when an em is the first thing inside a parent element

                            switch (true)
                            {
                                case (_global__highlight_on):
                                case ((_rangeToBuildHTMLWith.startOffset == 0) && (_node.firstChild) && (_node.firstChild == _rangeToBuildHTMLWith.startContainer)):
                                    break;

                                default:
                                    var _highlight_id_attribute = _node.getAttribute('highlight_id');
                                    if (_highlight_id_attribute > '')
                                        { _global__the_html += ' highlight_id="'+_highlight_id_attribute+'"'; }
                                    break;
                            }
                        }

                    //	close start
                    //	===========
                        if ($R.parsingOptions._elements_self_closing.indexOf('|'+_tag_name+'|') > -1) { _global__the_html += ' />'; }
                        else { _global__the_html += '>';}

                    /* mark */ _pos__start__after = _global__the_html.length;
                }


            //	child nodes
            //	===========
                if ($R.parsingOptions._elements_self_closing.indexOf('|'+_tag_name+'|') > -1); else
                {
                    for (var i=0, _i=_node.childNodes.length; i<_i; i++)
                        { _recursive(_node.childNodes[i]); }
                }


            //	end tag
            //	=======
                switch (true)
                {
                    case (_tag_is_ignored):
                        return;

                    case (($R.parsingOptions._elements_self_closing.indexOf('|'+_tag_name+'|') > -1)):
                        /* mark */ 	_pos__end__before = _global__the_html.length;
                        /* mark */ 	_pos__end__after = _global__the_html.length;
                        break;

                    default:
                        /* mark */ 	_pos__end__before = _global__the_html.length;
                        /* end */ 	_global__the_html += '</'+_tag_name+'>';
                        /* mark */ 	_pos__end__after = _global__the_html.length;
                        break;
                }


            //  protected elements
            //  ==================
                switch (true)
                {
                    //  some elemnts are protected from highlighting
                    case (($R.parsingOptions._elements_highlight_protect.indexOf('|'+_tag_name+'|') > -1)):
                    case ((_tag_name == 'em') && $(_node).hasClass('highlight')):

                        //  so, if highlights are inside an already highlighted element --or an unhighlightable one-- remove

                        _global__the_html = ''
                            + _global__the_html.substr(0, _pos__start__after)
                            +   _global__the_html.substr(_pos__start__after, (_pos__end__before - _pos__start__after))
                                    .replace(/<highlight>/gi, '')
                                    .replace(/<\/highlight>/gi, '')
                            + _global__the_html.substr(_pos__end__before)
                        ;

                        break;

                    //  some elements are invalid completely
                    case ((_tag_name == 'a') && (_node.className == 'deleteHighlight')):

                        _global__the_html = ''
                            + _global__the_html.substr(0, _pos__start__before)
                            + _global__the_html.substr(_pos__end__after)
                        ;

                        break;

                    //  some elements need to have their tags ignored
                    /*case (_tag_name == 'span'):

                        _global__the_html = ''
                            + _global__the_html.substr(0, _pos__start__before)
                            + _global__the_html.substr(_pos__start__after, (_pos__end__before - _pos__start__after))
                            + _global__the_html.substr(_pos__end__after)
                        ;

                        break;*/
                }

            //	return
                return;
        };

        //	actually do it
        _recursive(_elementToBuildHTMLFor);

        //  use em, instead of highlight
        _global__the_html = _global__the_html
            .replace(/<highlight>/gi, '<em class="highlight">')
            .replace(/<\/highlight>/gi, '</em>')
        ;

        //	return
        return _global__the_html;
    };



        //  speech
        //  ======


		//	keyboard shortcuts
		//	==================

	//	Keys, on Readable window
	//	========================
        $(window).keydown(function (_event) { return $R.ux__window_keydown(_event); });
        $R.ux__window_keydown = function (_event)
		{
			//	Readable visible?
			if ($R.visible); else { return; }

			//	include key combo detection

	/*
		_event must be defined
		_key_combo and _key_code will be defined at end of code
	*/

	var _key_code = 'NONE';
	switch (true)
	{
		case (_event.keyCode && (_event.keyCode >= 65 && _event.keyCode <= 90)):
			_key_code = String.fromCharCode(_event.keyCode).toUpperCase();
			break;

		case (_event.keyCode == 27):	_key_code = 'Escape';		break;
		case (_event.keyCode == 37):	_key_code = 'Left Arrow';	break;
		case (_event.keyCode == 39):	_key_code = 'Right Arrow';	break;
		case (_event.keyCode == 38):	_key_code = 'Up Arrow';		break;
		case (_event.keyCode == 40):	_key_code = 'Down Arrow';	break;
	}

	//	get
	//	===
		var _modifierKeys = (_event.originalEvent ? _event.originalEvent : _event);
		//	jQuery screws up -- fucks up the metaKey property badly

		var _key_combo = ''
			+ (_modifierKeys.ctrlKey ? 'Control + ' : '')
			+ (_modifierKeys.shiftKey ? 'Shift + ' : '')
			+ (_modifierKeys.altKey ? 'Alt + ' : '')
			+ (_modifierKeys.metaKey ? 'Command + ' : '')
			+ _key_code
		;

	//	needs a modifier -- if not just Escape key
	//	================
		if ((_key_code != 'Escape') && (_key_code == _key_combo))
		{
			_key_code = 'NONE';
			_key_combo = 'NONE';
		}


			//	stop
			var _stop = false;

			//	which?
			switch (true)
			{
				//	print
				case (_key_combo == 'Control + P' || _key_combo == 'Command + P'):
					window.print();
					_stop = true;
					break;


                //  disable highlight mode
                case ($R.highlight && (_key_combo == 'Escape')):
				case ($R.highlight && $R.vars && (_key_combo == $R.vars['keys_highlight'])):
                    $R.menu_functions['highlighting_to_evernote']();
                    break;

                //  enable highlight mode
				case ($R.vars && (_key_combo == $R.vars['keys_highlight'])):
                    $R.menu_functions['highlight_to_evernote']();
                    break;


				//	hide
				case (_key_combo == 'Escape'):
				case ($R.vars && (_key_combo == $R.vars['keys_activation'])):
				case (_key_combo == 'Control + Alt + Left Arrow'):
				case (_key_combo == 'Control + Command + Left Arrow'):
					$R.hide();
					_stop = true;
					break;


				//	clip
				case ($R.vars && (_key_combo == $R.vars['keys_clip'])):
					$R.menu_functions['clip_to_evernote'].call();
					_stop = true;
					break;



            }

			//	stop
			if (_stop)
			{
				_event.preventDefault();
				_event.stopPropagation();
			}
		};


        //	misc ux
		//	=======

    //  dialogs
    //  =======

		//	password reset
		$('#dialog__clip__login_reset div.dialog_canvas').click(function() { $R.customEvents.dispatchByName('to-extension--open--password-reset'); return false; });

        //  close all
        $('#sidebar_dialogs div.dialog.dynamic a.dialog_close, #sidebar_dialogs div.dialog.dynamic div.dialog_close a').click(function () { $R.hideOpenDialog(); return false; });
        $('#other_dialogs div.dialog.dynamic a.dialog_close, #other_dialogs div.dialog.dynamic div.dialog_close a').click(function () { $R.hideOpenDialog(); return false; });

        //  features -> eula
        $('#dialog__features__eula_notice a').click(function () { $R.showDialog('eula'); return false; });
        $('#dialog__eula_frame').attr('src', $R.paths['main']+'options/eula.html');

        //  speech
        //  ======



	//	good ux
	//	=======

        //  fitts
        $R.ux__fitts_click = function (_event) { $R.hide(); return false; };
		$R.$fitts.click(function (_event) { return $R.ux__fitts_click(_event); });

        //  background
        $R.ux__background_dblclick = function(_event){ $R.hide(); return false; };
		$R.$background.dblclick(function (_event) { return $R.ux__background_dblclick(_event); });


	//	scroll-back
	//	===========

        $R.scrollPosition = 0;
		$R.goToNamedAnchor = function (_anchor)
		{
			var _$e = $("[id='"+_anchor+"'], [name='"+_anchor+"']");
			if (_$e.length > 0); else { return; }

			$R.scrollPosition = $(window).scrollTop();
			$('#bottom_scroll_back').show();

			$(window).scrollTop(_$e.offset().top);
		};


		//	rtl
		//	===

	//	var
	//	===
		$R.rtl = false;


	//	functions
	//	=========
		$R.makeRTL = function ()
		{
            //  set
			$R.rtl = true;

            //  as component; return
            if ($R.component) { return; }


            $('#curtain__rtl__radio__rtl').get(0).checked = true;
            $('#curtain__rtl__radio__ltr').get(0).checked = false;

            $('html')
				.attr('dir', 'rtl')
				.addClass('couldBeRTL')
				.addClass('rtl');

            $R.$pages
                .attr('dir', 'rtl')
                .addClass('rtl');
		};

		$R.makeNotRTL = function ()
		{
            //  set
			$R.rtl = false;

            //  as component; return
            if ($R.component) { return; }


			$('#curtain__rtl__radio__rtl').get(0).checked = false;
			$('#curtain__rtl__radio__ltr').get(0).checked = true;

            $('html')
				.attr('dir', '')
				.removeClass('rtl');

            $R.$pages
                .attr('dir', '')
                .removeClass('rtl');
		};


	//	detect
	//	======
		(function ()
		{
			//	definitely rtl
			$R.$document.find('html, body').each(function (_i, _e)
			{
				switch (true) {
					case ($(_e).attr('dir') == 'rtl'):
					case ($(_e).css('direction') == 'rtl'):

					case ($(_e).attr('lang') == 'he'):
					case ($(_e).attr('lang') == 'he-il'):
					case ($(_e).attr('lang') == 'ar'):
					case ($(_e).attr('lang') == 'ur'):

						$R.makeRTL();
						return false;
				}
			});

			//	maybe rtl
            //  =========
            if ($R.component); else
            {
                if ((!$R.rtl) && ($R.$document.find("div[dir='rtl'], table[dir='rtl'], td[dir='rtl']").length > 0))
                    { $('html').addClass('couldBeRTL'); }
            }
		})();


	//	events
	//	======
        if ($R.component); else
        {
            $('#curtain__rtl__radio__rtl').change(function(){ $R.makeRTL(); return false; });
            $('#curtain__rtl__radio__ltr').change(function(){ $R.makeNotRTL(); return false; });
        }


		//	text
		//	====

	//	asian languages
	//	===============
	//	http://msdn.microsoft.com/en-us/goglobal/bb688158
	//	http://en.wikipedia.org/wiki/Japanese_punctuation
	//	http://en.wikipedia.org/wiki/Japanese_typographic_symbols
	//	http://unicode.org/charts/PDF/U3000.pdf
	//	CJK: Chnese, Japanese, Korean -- HAN character set


	//	length
	//	======
		$R.measureText__getTextLength = function (_the_text)
		{
			var _text = _the_text;

				_text = _text.replace(/[\s\n\r]+/gi, '');
				//_text = _text.replace(/\d+/, '');

			return _text.length;
		};


	//	word count
	//	==========
		$R.measureText__getWordCount = function (_the_text)
		{
			var _text = _the_text;

			//	do stuff
			//	========
				_text = _text.replace(/[\s\n\r]+/gi, ' ');

				_text = _text.replace(/([.,?!:;()\[\]'""-])/gi, ' $1 ');

				_text = _text.replace(/([\u3000])/gi, 				'[=words(1)]');
				_text = _text.replace(/([\u3001])/gi, 				'[=words(2)]');
				_text = _text.replace(/([\u3002])/gi, 				'[=words(4)]');
				_text = _text.replace(/([\u301C])/gi, 				'[=words(2)]');
				_text = _text.replace(/([\u2026|\u2025])/gi, 		'[=words(2)]');
				_text = _text.replace(/([\u30FB\uFF65])/gi, 		'[=words(1)]');
				_text = _text.replace(/([\u300C\u300D])/gi, 		'[=words(1)]');
				_text = _text.replace(/([\u300E\u300F])/gi,			'[=words(1)]');
				_text = _text.replace(/([\u3014\u3015])/gi,			'[=words(1)]');
				_text = _text.replace(/([\u3008\u3009])/gi,			'[=words(1)]');
				_text = _text.replace(/([\u300A\u300B])/gi, 		'[=words(1)]');
				_text = _text.replace(/([\u3010\u3011])/gi, 		'[=words(1)]');
				_text = _text.replace(/([\u3016\u3017])/gi, 		'[=words(1)]');
				_text = _text.replace(/([\u3018\u3019])/gi, 		'[=words(1)]');
				_text = _text.replace(/([\u301A\u301B])/gi, 		'[=words(1)]');
				_text = _text.replace(/([\u301D\u301E\u301F])/gi, 	'[=words(1)]');
				_text = _text.replace(/([\u30A0])/gi, 				'[=words(1)]');


			//	count
			//	=====
				var
					_count = 0,
					_words_match = _text.match(/([^\s\d]{3,})/gi)
				;

				//	add match
				_count += (_words_match != null ? _words_match.length : 0);

				//	add manual count
				_text.replace(/\[=words\((\d)\)\]/, function (_match, _plus) { _count += (5 * parseInt(_plus)); });


			//	return
			//	======
				return _count;
		};


	//	levenshtein
	//	===========
		$R.levenshteinDistance = function (str1, str2)
		{
			var l1 = str1.length, l2 = str2.length;
			if (Math.min(l1, l2) === 0)
				{ return Math.max(l1, l2); }

			var i = 0, j = 0, d = [];
			for (i = 0 ; i <= l1 ; i++)
			{
				d[i] = [];
				d[i][0] = i;
			}

			for (j = 0 ; j <= l2 ; j++)
				{ d[0][j] = j; }

			for (i = 1 ; i <= l1 ; i++)
			{
				for (j = 1 ; j <= l2 ; j++)
				{
					d[i][j] = Math.min
					(
						d[i - 1][j] + 1,
						d[i][j - 1] + 1,
						d[i - 1][j - 1] + (str1.charAt(i - 1) === str2.charAt(j - 1) ? 0 : 1)
					);
				}
			}
			return d[l1][l2];
		};


//  selection object
//  ================

    //  main object
    //  ===========
        $R.sel = {};


    //  get window
    //  ==========
        $R.sel.getWindowFromDocument = function (theDocument)
        {
            if (theDocument); else { return null; }

            if ('defaultView' in theDocument) {
                arguments.calee = function (theDocument) {
                    if (theDocument); else { return null; }
                    return theDocument.defaultView;
                };
            }
            else if ('parentWindow' in theDocument) {
                arguments.calee = function (theDocument) {
                    if (theDocument); else { return null; }
                    return theDocument.parentWindow;
                };
            }
            else {
                arguments.calee = function (theDocument) {
                    return null;
                };
            }

            return arguments.calee(theDocument);
        };


    //  get selection
    //  =============
        $R.sel.getSelection = function (theWindow)
        {
            if (theWindow); else { return null; }

            if ('getSelection' in theWindow) {
                arguments.calee = function (theWindow) {
                    if (theWindow); else { return null; }
                    return theWindow.getSelection();
                };
            }
            else if ('selection' in theWindow.document) {
                arguments.calee = function (theWindow) {
                    if (theWindow); else { return null; }
                    return theWindow.document.selection;
                };
            }
            else {
                arguments.calee = function (theWindow) {
                    return null;
                };
            }

            return arguments.calee(theWindow);
        };


    //  get range
    //  =========
        $R.sel.getRange = function (selection)
        {
            if (selection); else { return null; }

            if ('getRangeAt' in selection) {
                arguments.calee = function (selection) {
                    if (selection); else { return null; }
                    if (selection.rangeCount > 0) { return selection.getRangeAt(0); }
                    else { return null; }
                    //	doesn't work in old versions of safari
                    //	... I don't care
                };
            }
            else if ('createRange' in selection) {
                arguments.calee = function (selection) {
                    if (selection); else { return null; }
                    return selection.createRange();
                };
            }
            else {
                arguments.calee = function (selection) {
                    return null;
                };
            }

            return arguments.calee(selection);
        };


    //  get range HTML
    //  ==============
        $R.sel.getRangeHTML = function (range)
        {
            if (range); else { return null; }

            if ('htmlText' in range) {
                arguments.calee = function (range) {
                    if (range); else { return null; }
                    return range.htmlText;
                };
            }
            else if ('surroundContents' in range) {
                arguments.calee = function (range) {

                    if (range); else { return null; }
                    if (range.commonAncestorContainer && range.commonAncestorContainer.ownerDocument); else { return null; }

                    var dummy = range.commonAncestorContainer.ownerDocument.createElement("div");
                    dummy.appendChild(range.cloneContents());
                    return dummy.innerHTML;
                };
            }
            else {
                arguments.calee = function (range) {
                    return null;
                };
            }

            return arguments.calee(range);
        };


    //  get range text
    //  ==============
        $R.sel.getRangeText = function (range)
        {
            if (range); else { return null; }

            if ('text' in range) {
                arguments.calee = function (range) {
                    if (range); else { return null; }
                    return range.text;
                };
            }
            else if ('surroundContents' in range) {
                arguments.calee = function (range) {

                    if (range); else { return null; }
                    if (range.commonAncestorContainer && range.commonAncestorContainer.ownerDocument); else { return null; }

                    var dummy = range.commonAncestorContainer.ownerDocument.createElement("div");
                    dummy.appendChild(range.cloneContents());
                    return dummy.textContent;
                };
            }
            else {
                arguments.calee = function (range) {
                    return null;
                };
            }

            return arguments.calee(range);
        };



		//	content
		//	=======

    //  footnotes
	$R.footnotedLinksCount = 0;

    //  content mark
    $R.gotContent = false;

    //  content function
	$R.getContent = function ()
	{
        //  don't override
        if ($R.gotContent); else
        {
            //	homepage?
            if ($R.win.location.href == ($R.win.location.protocol + '//' + $R.win.location.host + '/'))
                { $('html').addClass('showTips'); }

            //	selection or whole
            switch (true)
            {
                case ($R.getContent__manualSelection()):
                    $R.gotContent = false;
                    break;

                case ($R.getContent__find()):
                    $R.gotContent = true;
                    break;

                default:
                    $R.gotContent = false;
                    break;
            }
        }

		//	debug
		$R.printDebugOutput();

		//	show content
		$R.showContent();
	};


	$R.getContent__manualSelection = function ()
	{
		var
			_selection = $R.sel.getSelection($R.win),
			_range = $R.sel.getRange(_selection),
			_html = $R.sel.getRangeHTML(_range),
			_text = $R.sel.getRangeText(_range)
		;

		if (_html > '' && _text > ''); else
		{
			_html = null;
			_text = null;

			$R.$document.find('frame, iframe').each(function (_i, _e)
			{
				if (_e.getAttribute('id') == 'readable_iframe') { return; }

				try
				{
					var
						__doc = $(_e).contents().get(0),
						__win = $R.sel.getWindowFromDocument(__doc),
						__selection = $R.sel.getSelection(__win),
						__range = $R.sel.getRange(__selection),
						__html = $R.sel.getRangeHTML(__range),
						__text = $R.sel.getRangeText(__range)
					;

					if (__html > '' && __text > '')
					{
						_html = __html;
						_text = __text;

						// stop the each
						return false;
					}
				}
				catch(e) { }
			});
		}

		//	haven't found anything
		if (_html > '' && _text > ''); else { return false; }

		//	probably selected something by mistake
		if ($R.measureText__getTextLength(_text) > (65 * 3 * 1.5)); else { return false; }

		//	display
		//	=======
			$R.$pages.html('');
			$R.displayPageHTML(_html, 1, 'selection');

		//	return true
		return true;
	};



	//	options
	//	=======
		$R.parsingOptions =
		{
			'_elements_ignore': 			        '|button|input|select|textarea|optgroup|command|datalist|--|frame|frameset|noframes|--|style|link|script|noscript|--|canvas|applet|map|--|marquee|area|base|',
			'_elements_ignore_tag': 		        '|form|fieldset|details|dir|--|center|font|span|',

			'_elements_container': 			        '|body|--|article|section|--|div|--|td|--|li|--|dd|dt|',
            '_elements_self_closing': 		        '|br|hr|--|img|--|col|--|source|--|embed|param|--|iframe|',

			'_elements_visible': 			        '|article|section|--|ul|ol|li|dd|--|table|tr|td|--|div|--|p|--|h1|h2|h3|h4|h5|h6|--|span|',
			'_elements_too_much_content': 	        '|b|i|em|strong|--|h1|h2|h3|h4|h5|--|td|',
			'_elements_link_density':		        '|div|--|table|ul|ol|--|section|aside|header|',
			'_elements_floating':			        '|div|--|table|',
			'_elements_above_target_ignore':        '|br|--|ul|ol|dl|--|table|',

            '_elements_highlight_protect':          '|video|audio|source|--|object|param|embed|',

            '_elements_keep_attributes':
			{
				'a': 		['href', 'title', 'name'],
				'img': 		['src', 'width', 'height', 'alt', 'title'],

				'video': 	['src', 'width', 'height', 'poster', 'audio', 'preload', 'autoplay', 'loop', 'controls'],
				'audio': 	['src', 'preload', 'autoplay', 'loop', 'controls'],
				'source': 	['src', 'type'],

				'object': 	['data', 'type', 'width', 'height', 'classid', 'codebase', 'codetype'],
				'param': 	['name', 'value'],
				'embed': 	['src', 'type', 'width', 'height', 'flashvars', 'allowscriptaccess', 'allowfullscreen', 'bgcolor'],

				'iframe':	['src', 'width', 'height', 'frameborder', 'scrolling'],

				'td':		['colspan', 'rowspan'],
				'th':		['colspan', 'rowspan']
			}
		};


	//	next page keywords -- (?? charCodeAt() > 127)
	//	==================
		$R.nextPage__captionKeywords =
		[
			/* english */
			'next page', 'next',

			/* german */
			'vorw&#228;rts', 'weiter',

			/* japanese */
			'&#27425;&#12408;',

            /* chinese */
            '&#19979;&#19968;&#39029;', '&#19979;&#19968;&#31456;', '&#19979;&#39029;', '&#19979;&#31456;',
            '&#32763;&#39029;', '&#32763;&#19979;&#39029;', '&#19979;&#19968;&#24352;', '&#19979;&#19968;&#24133;',
            '&#19979;&#19968;&#33410;', '&#19979;&#19968;&#31687;',  '&#21518;&#19968;&#39029;', '&#19979;&#31687;',

            /* zh-tw */
            '&#19979;&#19968;&#38913;', '&#19979;&#19968;&#24373;', '&#19979;&#38913;', '&#19979;&#24373;',
            '&#32763;&#38913;', '&#32763;&#19979;&#38913;', '&#19979;&#19968;&#24373;',
		];

		$R.nextPage__captionKeywords__not =
		[
			/* english */
			'article', 'story', 'post', 'comment', 'section', 'chapter'

		];


	//	skip links
	//	==========
		$R.skipStuffFromDomains__links =
		[
			'doubleclick.net',
            'fastclick.net',
			'adbrite.com',
			'adbureau.net',
			'admob.com',
			'bannersxchange.com',
			'buysellads.com',
			'impact-ad.jp',
			'atdmt.com',
			'advertising.com',
			'itmedia.jp',
			'microad.jp',
			'serving-sys.com',
            'adplan-ds.com'
		];


	//	skip images
	//	===========
		$R.skipStuffFromDomain__images =
		[
			'googlesyndication.com',
            'fastclick.net',
			'.2mdn.net',
			'de17a.com',
			'content.aimatch.com',
			'bannersxchange.com',
			'buysellads.com',
			'impact-ad.jp',
			'atdmt.com',
			'advertising.com',
			'itmedia.jp',
			'microad.jp',
			'serving-sys.com',
            'adplan-ds.com'
		];


	//	keep video
	//	==========

		$R.keepStuffFromDomain__video =
		[
			'youtube.com',
			'youtube-nocookie.com',

			'vimeo.com',
			'hulu.com',
			'yahoo.com',
			'flickr.com',
			'newsnetz.ch'
		];


	$R.getContent__exploreNodeAndGetStuff = function (_nodeToExplore, _justExploring)
	{
		var
			_global__element_index = 0,

			_global__inside_link = false,
			_global__inside_link__element_index = 0,

			_global__length__above_plain_text = 0,
			_global__count__above_plain_words = 0,
			_global__length__above_links_text = 0,
			_global__count__above_links_words = 0,
            _global__count__above_candidates = 0,
            _global__count__above_containers = 0,
			_global__above__plain_text = '',
			_global__above__links_text = '',

			_return__containers = [],
			_return__candidates = [],
			_return__links = []
		;

		//	recursive function
		//	==================
		var _recursive = function (_node)
		{
			//	increment index
			//	starts with 1
			_global__element_index++;

			var
				_tag_name = (_node.nodeType === 3 ? '#text' : ((_node.nodeType === 1 && _node.tagName && _node.tagName > '') ? _node.tagName.toLowerCase() : '#invalid')),
				_result =
				{
					'__index': _global__element_index,
					'__node': _node,


					'_is__container': 		($R.parsingOptions._elements_container.indexOf('|'+_tag_name+'|') > -1),
					'_is__candidate': 		false,
					'_is__text': 			false,
					'_is__link': 			false,
					'_is__link_skip': 		false,
					'_is__image_small': 	false,
					'_is__image_medium': 	false,
					'_is__image_large': 	false,
					'_is__image_skip': 		false,

					'_debug__above__plain_text': _global__above__plain_text,
					'_debug__above__links_text': _global__above__links_text,


					'_length__above_plain_text': _global__length__above_plain_text,
					'_count__above_plain_words': _global__count__above_plain_words,

					'_length__above_links_text': _global__length__above_links_text,
					'_count__above_links_words': _global__count__above_links_words,

					'_length__above_all_text': 	(_global__length__above_plain_text + _global__length__above_links_text),
					'_count__above_all_words': 	(_global__count__above_plain_words + _global__count__above_links_words),

                    '_count__above_candidates': _global__count__above_candidates,
                    '_count__above_containers': _global__count__above_containers,

					'_length__plain_text': 0,
					'_count__plain_words': 0,

					'_length__links_text': 0,
					'_count__links_words': 0,

					'_length__all_text': 0,
					'_count__all_words': 0,


					'_count__containers': 0,
					'_count__candidates': 0,

					'_count__links': 0,
					'_count__links_skip': 0,

					'_count__images_small': 0,
					'_count__images_medium': 0,
					'_count__images_large': 0,
					'_count__images_skip': 0
				};


			//	fast return
			//	===========
				switch (true)
				{
					case ((_tag_name == '#invalid')):
					case (($R.parsingOptions._elements_ignore.indexOf('|'+_tag_name+'|') > -1)):
						return;

					case (($R.parsingOptions._elements_visible.indexOf('|'+_tag_name+'|') > -1)):

	//	included inline
	//	_node, _tag_name must be defined
	//	will return, if node is hidden

	switch (true)
	{
		case (_node.offsetWidth > 0):
		case (_node.offsetHeight > 0):
			break;

		default:
			switch (true)
			{
				case (_node.offsetLeft > 0):
				case (_node.offsetTop > 0):
					break;

				default:
                    //  exclude inline DIVs -- which, stupidly, don't have a width/height
                    if ((_tag_name == 'div') && ((_node.style.display || $.css( _node, "display" )) == 'inline'))
                        { break; }

                    //  it's hidden; exit current scope
					return;
			}
			break;
	}

						break;

					//	self-closing -- with some exceptions
					case ($R.parsingOptions._elements_self_closing.indexOf('|'+_tag_name+'|') > -1):
						switch (true)
						{
							case ((_tag_name == 'img')): break;
							default: return;
						}
						break;
				}


			//	do stuff
			//	========
				switch (true)
				{
					//	text node
					//	=========
						case ((_tag_name == '#text')):
							//	mark
							_result._is__text = true;

							//	get
							var _nodeText = _node.nodeValue;

							//	result
							_result._length__plain_text = $R.measureText__getTextLength(_nodeText);
							_result._count__plain_words = $R.measureText__getWordCount(_nodeText);

							if (_global__inside_link)
							{
								_global__length__above_links_text += _result._length__plain_text;
								_global__count__above_links_words += _result._count__plain_words;
								if (false && $R.debug) { _global__above__links_text += ' ' + _nodeText; }
							}
							else
							{
								_global__length__above_plain_text += _result._length__plain_text;
								_global__count__above_plain_words += _result._count__plain_words;
								if (false && $R.debug) { _global__above__plain_text += ' ' + _nodeText; }
							}

							//	return text
							return _result;


					//	link
					//	====
						case (_tag_name == 'a'):
							var _href = _node.href;

							//	sanity
							if (_href > ''); else { break; }
							if (_href.indexOf); else { break; }

							_result._is__link = true;

							//	skip
							for (var i=0, _i=$R.skipStuffFromDomains__links.length; i<_i; i++)
							{
								if (_node.href.indexOf($R.skipStuffFromDomains__links[i]) > -1)
									{ _result._is__link_skip = true; break; }
							}

							//	inside link
							if (_global__inside_link); else
							{
								_global__inside_link = true;
								_global__inside_link__element_index = _result.__index;
							}

							//	done
							_return__links.push(_result);
							break;


					//	image
					//	=====
						case (_tag_name == 'img'):

							//	skip
							//	====
								if (_node.src && _node.src.indexOf)
								{
									for (var i=0, _i=$R.skipStuffFromDomain__images.length; i<_i; i++)
									{
										if (_node.src.indexOf($R.skipStuffFromDomain__images[i]) > -1)
											{ _result._is__image_skip = true; break; }
									}
								}

							//	size
							//	====
								var	_width = $(_node).width(), _height = $(_node).height();
								switch (true)
								{
									case ((_width * _height) >= 50000):
									case ((_width >= 350) && (_height >= 75)):
										_result._is__image_large = true;
										break;

									case ((_width * _height) >= 20000):
									case ((_width >= 150) && (_height >= 150)):
										_result._is__image_medium = true;
										break;

									case ((_width <= 5) && (_height <= 5)):
										_result._is__image_skip = true;
										break;

									default:
										_result._is__image_small = true;
										break;
								}

							break;
				}


			//	child nodes
			//	===========
				for (var i=0, _i=_node.childNodes.length; i<_i; i++)
				{
					var
						_child = _node.childNodes[i],
						_child_result = _recursive(_child)
					;

					//	if false, continue
					//	==================
						if (_child_result); else { continue; }


					//	add to result
					//	=============
						_result._count__links += 			_child_result._count__links + 			(_child_result._is__link ? 1 : 0);
						_result._count__links_skip += 		_child_result._count__links_skip + 		(_child_result._is__link_skip ? 1 : 0);

						_result._count__images_small += 	_child_result._count__images_small + 	(_child_result._is__image_small ? 1 : 0);
						_result._count__images_medium += 	_child_result._count__images_medium + 	(_child_result._is__image_medium ? 1 : 0);
						_result._count__images_large += 	_child_result._count__images_large + 	(_child_result._is__image_large ? 1 : 0);
						_result._count__images_skip += 		_child_result._count__images_skip + 	(_child_result._is__image_skip ? 1 : 0);

						_result._count__containers += 		_child_result._count__containers + 		(_child_result._is__container ? 1 : 0);
						_result._count__candidates += 		_child_result._count__candidates + 		(_child_result._is__candidate ? 1 : 0);

						_result._length__all_text += 		_child_result._length__plain_text + 	_child_result._length__links_text;
						_result._count__all_words += 		_child_result._count__plain_words + 	_child_result._count__links_words;

						//	plain text / link text
						//	======================
							switch (true)
							{
								case (_child_result._is__link):
									//	no text to add
									_result._length__links_text += (_child_result._length__plain_text + _child_result._length__links_text);
									_result._count__links_words += (_child_result._count__plain_words + _child_result._count__links_words);
									break;

								default:
									_result._length__plain_text += 			_child_result._length__plain_text;
									_result._count__plain_words += 			_child_result._count__plain_words;
									_result._length__links_text += 			_child_result._length__links_text;
									_result._count__links_words += 			_child_result._count__links_words;
									break;
							}
				}


			//	after child nodes
			//	=================

				//	mark as not in link anymore
				//	===========================
					if (true
						&& (_result._is__link)
						&& (_global__inside_link__element_index == _result.__index)
					) {
						_global__inside_link = false;
						_global__inside_link__element_index = 0;
					}


			//	add to containers
			//	=================
				if (_result._is__container || ((_result.__index == 1) && (_justExploring == true)))
				{
					//	add to containers
					_return__containers.push(_result);

                    //  increase above containers
                    if (_result._is__container) { _global__count__above_containers++; }

					//	add to candidates
					if (_justExploring); else
					{
						switch (true)
						{
							case (($R.language != 'cjk') && ((_result._count__links * 2) >= _result._count__plain_words)):  /* link ratio */

                            case (($R.language != 'cjk') && (_result._length__plain_text < (65 / 3))):  /* text length */
							case (($R.language != 'cjk') && (_result._count__plain_words < 5)):			/* words */

                            case (($R.language == 'cjk') && (_result._length__plain_text < 10)):	    /* text length */
							case (($R.language == 'cjk') && (_result._count__plain_words < 2)):			/* words */


							//case (_result._length__plain_text == 0):    /* no text */
							//case (_result._count__plain_words == 0):    /* no words */

                            //case (($R.language == 'cjk') && ((_result._length__plain_text / 65 / 3) < 0.1)):				/* paragrahs of 3 lines */
							//case (($R.language != 'cjk') && ((_result._count__plain_words / 50) < 0.5)):					/* paragraphs of 50 words */

                                //	not a valid candidate
                                //if (_tag_name == 'div') { $R.log('bad candidate', _result.__node); }

                                break;

							default:
								//	good candidate
								_result._is__candidate = true;
								_return__candidates.push(_result);

                                //  increase above candidates
                                _global__count__above_candidates++;

								break;
						}

						//	special case for body -- if it was just skipped
						//	=====================
							if ((_result.__index == 1) && !(_result._is__candidate))
							{
								_result._is__candidate = true;
								_result._is__bad = true;
								_return__candidates.push(_result);
							}
					}
				}


			//	return
			//	======
				return _result;
		};


		//	actually do it
		//	==============
			_recursive(_nodeToExplore);

		//	just exploring -- return first thing
		//	==============
			if (_justExploring) { return _return__containers.pop(); }

		//	return containers list
		//	======================
			return {
				'_containers': 	_return__containers,
				'_candidates': 	_return__candidates,
				'_links': 		_return__links
			};
	};



	$R.getContent__processCandidates = function (_candidatesToProcess)
	{
		//	process this var
		//	================
			var _candidates = _candidatesToProcess;


		//	sort _candidates -- the lower in the dom, the closer to position 0
		//	================
			_candidates.sort(function (a, b)
			{
				switch (true)
				{
					case (a.__index < b.__index): return -1;
					case (a.__index > b.__index): return 1;
					default: return 0;
				}
			});


		//	get first
		//	=========
			var	_main = _candidates[0]
			if ($R.debug) { $R.log('should be body', _main, _main.__node); }


		//	pieces of text
		//	and points computation
		//	======================
			for (var i=0, _i=_candidates.length; i<_i; i++)
			{
				//	pieces
				//	======
					var
						_count__pieces = 0,
						_array__pieces = []
					;

					for (var k=i, _k=_candidates.length; k<_k; k++)
					{
						if (_candidates[k]._count__candidates > 0) { continue; }
						if ($.contains(_candidates[i].__node, _candidates[k].__node)); else { continue; }

						//	store piece, if in debug mode
						if ($R.debug) { _array__pieces.push(_candidates[k]); }

						//	incement pieces count
						_count__pieces++;
					}


				//	candidate details
				//	=================
					_candidates[i]['__candidate_details'] = $R.getContent__computeDetailsForCandidate(_candidates[i], _main);


				//	pieces -- do this here because _main doesn't yet have a pieces count
				//	======

					//	set pieces
					_candidates[i]['_count__pieces'] = _count__pieces;
					_candidates[i]['_array__pieces'] = _array__pieces;

					//	pieces ratio
					_candidates[i]['__candidate_details']['_ratio__count__pieces_to_total_pieces'] = (_count__pieces / (_candidates[0]._count__pieces + 1));


                //  check some more
                //  ===============
                /*    switch (true)
                    {
                        case (($R.language != 'cjk') && (_candidates[i]['__candidate_details']['_ratio__length__links_text_to_plain_text'] > 1)):
                        case (($R.language != 'cjk') && (_candidates[i]['__candidate_details']['_ratio__count__links_words_to_plain_words'] > 1)):
                            _candidates[i]._is__bad = true;
                            break;
                    }*/


				//	points
				//	======
					_candidates[i].__points_history = $R.getContent__computePointsForCandidate(_candidates[i], _main);
					_candidates[i].__points = _candidates[i].__points_history[0];
			}


		//	sort _candidates -- the more points, the closer to position 0
		//	================
			_candidates.sort(function (a, b)
			{
				switch (true)
				{
					case (a.__points > b.__points): return -1;
					case (a.__points < b.__points): return 1;
					default: return 0;
				}
			});


		//	return
		//	======
			return _candidates;
	};


	$R.getContent__computeDetailsForCandidate = function (_e, _main)
	{
		var _r = {};


		//	bad candidate
		//	=============
			if (_e._is__bad) { return _r; }


		//	paragraphs
		//	==========
			_r['_count__lines_of_65_characters'] = (_e._length__plain_text / 65);
			_r['_count__paragraphs_of_3_lines'] =  (_r._count__lines_of_65_characters / 3);
			_r['_count__paragraphs_of_5_lines'] =  (_r._count__lines_of_65_characters / 5);

			_r['_count__paragraphs_of_50_words'] = (_e._count__plain_words / 50);
			_r['_count__paragraphs_of_80_words'] = (_e._count__plain_words / 80);


		//	total text
		//	==========
			_r['_ratio__length__plain_text_to_total_plain_text'] =  (_e._length__plain_text / _main._length__plain_text);
			_r['_ratio__count__plain_words_to_total_plain_words'] = (_e._count__plain_words / _main._count__plain_words);


		//	links
		//	=====
			_r['_ratio__length__links_text_to_plain_text'] =  (_e._length__links_text / _e._length__plain_text);
			_r['_ratio__count__links_words_to_plain_words'] = (_e._count__links_words / _e._count__plain_words);

			_r['_ratio__length__links_text_to_all_text'] =  (_e._length__links_text / _e._length__all_text);
			_r['_ratio__count__links_words_to_all_words'] = (_e._count__links_words / _e._count__all_words);

			_r['_ratio__length__links_text_to_total_links_text'] =  (_e._length__links_text / (_main._length__links_text + 1));
			_r['_ratio__count__links_words_to_total_links_words'] = (_e._count__links_words / (_main._count__links_words + 1));

			_r['_ratio__count__links_to_total_links'] = (_e._count__links / (_main._count__links + 1));
			_r['_ratio__count__links_to_plain_words'] = ((_e._count__links * 2) / _e._count__plain_words);


		//	text above
		//	==========
            var
                _divide__candidates = Math.max(2, Math.ceil(_e._count__above_candidates * 0.5)),

                _above_text = ((0
                    + (_e._length__above_plain_text * 1)
                    + (_e._length__above_plain_text / _divide__candidates)
                ) / 2),

                _above_words = ((0
                    + (_e._count__above_plain_words * 1)
                    + (_e._count__above_plain_words / _divide__candidates)
                ) / 2)
            ;

			_r['_ratio__length__above_plain_text_to_total_plain_text'] =  (_above_text / _main._length__plain_text);
			_r['_ratio__count__above_plain_words_to_total_plain_words'] = (_above_words / _main._count__plain_words);


		//	candidates
		//	==========
			_r['_ratio__count__candidates_to_total_candidates'] = (_e._count__candidates / (_main._count__candidates + 1));
			_r['_ratio__count__containers_to_total_containers'] = (_e._count__containers / (_main._count__containers + 1));


		//	return
		//	======
			return _r;
	};


	$R.getContent__computePointsForCandidate = function (_e, _main)
	{
		var
			_details = _e.__candidate_details,
			_points_history = [],
            _really_big = ((_main._length__plain_text / 65) > 250)
		;

		//	bad candidate
		if (_e._is__bad) { return [0]; }


		//	the basics
		//	==========
			_points_history.unshift(((0
				+ (_details._count__paragraphs_of_3_lines)
				+ (_details._count__paragraphs_of_5_lines * 1.5)
				+ (_details._count__paragraphs_of_50_words)
				+ (_details._count__paragraphs_of_80_words * 1.5)
				+ (_e._count__images_large * 3)
				- ((_e._count__images_skip + _e._count__images_small) * 0.5)
			) * 1000));

            //  negative
            if (_points_history[0] < 0) { return [0]; }


        //  candidates, containers, pieces
        //  ==============================
            var
                _divide__pieces =     Math.max(5,  Math.ceil(_e._count__pieces *     0.25)),
                _divide__candidates = Math.max(5,  Math.ceil(_e._count__candidates * 0.25)),
                _divide__containers = Math.max(10, Math.ceil(_e._count__containers * 0.25))
            ;

            _points_history.unshift(((0
                + (_points_history[0] * 3)
                + (_points_history[0] / _divide__pieces)
                + (_points_history[0] / _divide__candidates)
                + (_points_history[0] / _divide__containers)
            ) / 6));


		//	total text
		//	==========
			$R.getContent__computePointsForCandidate__do(0.10, 2, (1 - (1 - _details._ratio__length__plain_text_to_total_plain_text)), _points_history);
			$R.getContent__computePointsForCandidate__do(0.10, 2, (1 - (1 - _details._ratio__count__plain_words_to_total_plain_words)), _points_history);

            if (_really_big) {
            $R.getContent__computePointsForCandidate__do(0.10, 4, (1 - (1 - _details._ratio__length__plain_text_to_total_plain_text)), _points_history);
            $R.getContent__computePointsForCandidate__do(0.10, 4, (1 - (1 - _details._ratio__count__plain_words_to_total_plain_words)), _points_history);
            }


		//	text above
		//	==========
			$R.getContent__computePointsForCandidate__do(0.10, 5, (1 - _details._ratio__length__above_plain_text_to_total_plain_text), _points_history);
			$R.getContent__computePointsForCandidate__do(0.10, 5, (1 - _details._ratio__count__above_plain_words_to_total_plain_words), _points_history);

            if (_really_big) {
            $R.getContent__computePointsForCandidate__do(0.10, 10, (1 - _details._ratio__length__above_plain_text_to_total_plain_text), _points_history);
            $R.getContent__computePointsForCandidate__do(0.10, 10, (1 - _details._ratio__count__above_plain_words_to_total_plain_words), _points_history);
            }


		//	links outer
		//	===========
            $R.getContent__computePointsForCandidate__do(0.75, 1, (1 - _details._ratio__length__links_text_to_total_links_text), _points_history);
            $R.getContent__computePointsForCandidate__do(0.75, 1, (1 - _details._ratio__count__links_words_to_total_links_words), _points_history);

            $R.getContent__computePointsForCandidate__do(0.75, 1, (1 - _details._ratio__count__links_to_total_links), _points_history);


        //  links inner
        //  ===========
            var __lr = ($R.language == 'cjk' ? 0.75 : 0.50);

            $R.getContent__computePointsForCandidate__do(__lr, 1, (1 - _details._ratio__length__links_text_to_plain_text), _points_history);
            $R.getContent__computePointsForCandidate__do(__lr, 1, (1 - _details._ratio__count__links_words_to_plain_words), _points_history);

            $R.getContent__computePointsForCandidate__do(__lr, 1, (1 - _details._ratio__length__links_text_to_all_text), _points_history);
            $R.getContent__computePointsForCandidate__do(__lr, 1, (1 - _details._ratio__count__links_words_to_all_words), _points_history);

            $R.getContent__computePointsForCandidate__do(__lr, 1, (1 - _details._ratio__count__links_to_plain_words), _points_history);


		//	candidates, containers, pieces
		//	==============================
			$R.getContent__computePointsForCandidate__do(0.75, 1, (1 - _details._ratio__count__candidates_to_total_candidates), _points_history);
			$R.getContent__computePointsForCandidate__do(0.75, 1, (1 - _details._ratio__count__containers_to_total_containers), _points_history);
			$R.getContent__computePointsForCandidate__do(0.75, 1, (1 - _details._ratio__count__pieces_to_total_pieces), _points_history);


		//	return -- will get [0] as the actual final points
		//	======
			return _points_history;
	};



	$R.getContent__processCandidatesSecond = function (_processedCandidates)
	{
		var
			_candidates = _processedCandidates,
			_main = _candidates[0]
		;

		//	only get children of target
		//	===========================
			_candidates = $.map(_candidates, function (_element, _index)
			{
				switch (true)
				{
					case (!(_index > 0)):
					case (!($.contains(_main.__node, _element.__node))):
						return null;

					default:
						return _element;
				}
			});

            //  add main - to amke sure the result is never blank
            _candidates.unshift(_main);


		//	sort _candidates -- the lower in the dom, the closer to position 0
		//	================
			_candidates.sort(function (a, b)
			{
				switch (true)
				{
					case (a.__index < b.__index): return -1;
					case (a.__index > b.__index): return 1;
					default: return 0;
				}
			});


		//	second candidate computation
		//	============================
			for (var i=0, _i=_candidates.length; i<_i; i++)
			{
				//	additional numbers
				//	==================
					_candidates[i].__second_length__above_plain_text = (_candidates[i]._length__above_plain_text - _main._length__above_plain_text);
					_candidates[i].__second_count__above_plain_words = (_candidates[i]._count__above_plain_words - _main._count__above_plain_words);

				//	candidate details
				//	=================
					_candidates[i]['__candidate_details_second'] = $R.getContent__computeDetailsForCandidateSecond(_candidates[i], _main);

				//	check some more
				//	===============
				/*	switch (true)
					{
                        case (!(_candidates[i]['__candidate_details_second']['_ratio__count__plain_words_to_total_plain_words'] > 0.05)):
						case (!(_candidates[i]['__candidate_details_second']['_ratio__length__plain_text_to_total_plain_text'] > 0.05)):

						//case (!(_candidates[i]['__candidate_details_second']['_ratio__count__above_plain_words_to_total_plain_words'] < 0.1)):
						//case (!(_candidates[i]['__candidate_details_second']['_ratio__length__above_plain_text_to_total_plain_text'] < 0.1)):

                        //case (_candidates[i]['__candidate_details_second']['_ratio__length__above_plain_text_to_plain_text'] > 1):
                        //case (_candidates[i]['__candidate_details_second']['_ratio__count__above_plain_words_to_plain_words'] > 1):

                            _candidates[i]._is__bad = true;
							//	wil set points to 0, in points computation function
							break;
					}*/

				//	points
				//	======
					_candidates[i].__points_history_second = $R.getContent__computePointsForCandidateSecond(_candidates[i], _main);
					_candidates[i].__points_second = _candidates[i].__points_history_second[0];
			}


		//	sort _candidates -- the more points, the closer to position 0
		//	================
			_candidates.sort(function (a, b)
			{
				switch (true)
				{
					case (a.__points_second > b.__points_second): return -1;
					case (a.__points_second < b.__points_second): return 1;
					default: return 0;
				}
			});


		//	return
		//	======
			return _candidates;
	};


	$R.getContent__computeDetailsForCandidateSecond = function (_e, _main)
	{
		var _r = {};


		//	bad candidate
		//	=============
			if (_e._is__bad) { return _r; }


		//	total text
		//	==========
			_r['_ratio__length__plain_text_to_total_plain_text'] = 	(_e._length__plain_text / _main._length__plain_text);
			_r['_ratio__count__plain_words_to_total_plain_words'] = (_e._count__plain_words / _main._count__plain_words);


		//	links
		//	=====
			_r['_ratio__length__links_text_to_all_text'] =	(_e._length__links_text / _e._length__all_text);
			_r['_ratio__count__links_words_to_all_words'] = (_e._count__links_words / _e._count__all_words);

			_r['_ratio__length__links_text_to_total_links_text'] = 	(_e._length__links_text / (_main._length__links_text + 1));
			_r['_ratio__count__links_words_to_total_links_words'] = (_e._count__links_words / (_main._count__links_words + 1));

			_r['_ratio__count__links_to_total_links'] = (_e._count__links / (_main._count__links + 1));
			_r['_ratio__count__links_to_plain_words'] = ((_e._count__links * 2) / _e._count__plain_words);


		//	text above
		//	==========

            var
                _divide__candidates = Math.max(2, Math.ceil((_e._count__above_candidates - _main._count__above_candidates) * 0.5)),

                _above_text = ((0
                    + (_e.__second_length__above_plain_text * 1)
                    + (_e.__second_length__above_plain_text / _divide__candidates)
                ) / 2),

                _above_words = ((0
                    + (_e.__second_count__above_plain_words * 1)
                    + (_e.__second_count__above_plain_words / _divide__candidates)
                ) / 2)
            ;

			_r['_ratio__length__above_plain_text_to_total_plain_text'] =  (_above_text / _main._length__plain_text);
			_r['_ratio__count__above_plain_words_to_total_plain_words'] = (_above_words / _main._count__plain_words);

			_r['_ratio__length__above_plain_text_to_plain_text'] = 	(_above_text / _e._length__plain_text);
			_r['_ratio__count__above_plain_words_to_plain_words'] = (_above_words / _e._count__plain_words);


		//	candidates
		//	==========
			_r['_ratio__count__candidates_to_total_candidates'] = (Math.max(0, (_e._count__candidates - (_main._count__candidates * 0.25))) / (_main._count__candidates + 1));
			_r['_ratio__count__containers_to_total_containers'] = (Math.max(0, (_e._count__containers - (_main._count__containers * 0.25))) / (_main._count__containers + 1));
			_r['_ratio__count__pieces_to_total_pieces'] =         (Math.max(0, (_e._count__pieces - (_main._count__pieces * 0.25))) / (_main._count__pieces + 1));


		//	return
		//	======
			return _r;
	};


	$R.getContent__computePointsForCandidateSecond = function (_e, _main)
	{
		var
			_details = _e.__candidate_details,
			_details_second = _e.__candidate_details_second,
			_points_history = []
		;

		//	bad candidate
		if (_e._is__bad) { return [0]; }


		//	get initial points
		//	==================
			_points_history.unshift(_e.__points_history[(_e.__points_history.length-1)]);


        //  candidates, containers, pieces
        //  ==============================
            var
                _divide__pieces =     Math.max(5,  Math.ceil(_e._count__pieces *     0.25)),
                _divide__candidates = Math.max(5,  Math.ceil(_e._count__candidates * 0.25)),
                _divide__containers = Math.max(10, Math.ceil(_e._count__containers * 0.25))
            ;

            _points_history.unshift(((0
                + (_points_history[0] * 3)
                + ((_points_history[0] / _divide__pieces) * 2)
                + ((_points_history[0] / _divide__candidates) * 2)
                + ((_points_history[0] / _divide__containers) * 2)
            ) / 9));


		//	total text
		//	==========
			$R.getContent__computePointsForCandidate__do(0.50, 1, (1 - (1 - _details_second._ratio__length__plain_text_to_total_plain_text)), _points_history);
			$R.getContent__computePointsForCandidate__do(0.50, 1, (1 - (1 - _details_second._ratio__count__plain_words_to_total_plain_words)), _points_history);


		//	text above
		//	==========
            var __ar = ($R.language == 'cjk' ? 0.50 : 0.10);

			$R.getContent__computePointsForCandidate__do(__ar, 1, (1 - _details_second._ratio__length__above_plain_text_to_total_plain_text), _points_history);
			$R.getContent__computePointsForCandidate__do(__ar, 1, (1 - _details_second._ratio__count__above_plain_words_to_total_plain_words), _points_history);

			$R.getContent__computePointsForCandidate__do(__ar, 1, (1 - _details_second._ratio__length__above_plain_text_to_plain_text), _points_history);
			$R.getContent__computePointsForCandidate__do(__ar, 1, (1 - _details_second._ratio__count__above_plain_words_to_plain_words), _points_history);


		//	links outer
		//	===========
			$R.getContent__computePointsForCandidate__do(0.75, 1, (1 - _details_second._ratio__count__links_to_total_links), _points_history);
			$R.getContent__computePointsForCandidate__do(0.75, 1, (1 - _details_second._ratio__length__links_text_to_total_links_text), _points_history);
			$R.getContent__computePointsForCandidate__do(0.75, 1, (1 - _details_second._ratio__count__links_words_to_total_links_words), _points_history);


		//	links inner
		//	===========
            var __lr = ($R.language == 'cjk' ? 0.75 : 0.50);

			$R.getContent__computePointsForCandidate__do(__lr, 1, (1 - _details._ratio__length__links_text_to_plain_text), _points_history);
			$R.getContent__computePointsForCandidate__do(__lr, 1, (1 - _details._ratio__count__links_words_to_plain_words), _points_history);

			$R.getContent__computePointsForCandidate__do(__lr, 1, (1 - _details_second._ratio__length__links_text_to_all_text), _points_history);
			$R.getContent__computePointsForCandidate__do(__lr, 1, (1 - _details_second._ratio__count__links_words_to_all_words), _points_history);

			$R.getContent__computePointsForCandidate__do(__lr, 1, (1 - _details_second._ratio__count__links_to_plain_words), _points_history);


		//	candidates, containers, pieces
		//	==============================
			$R.getContent__computePointsForCandidate__do(0.10, 2, (1 - _details_second._ratio__count__candidates_to_total_candidates), _points_history);
			$R.getContent__computePointsForCandidate__do(0.10, 2, (1 - _details_second._ratio__count__containers_to_total_containers), _points_history);
			$R.getContent__computePointsForCandidate__do(0.10, 2, (1 - _details_second._ratio__count__pieces_to_total_pieces), _points_history);


		//	return -- will get [0] as the actual final points
		//	======
			return _points_history;
	};



	$R.getContent__computePointsForCandidateThird = function (_e, _main)
	{
		var
			_details = _e.__candidate_details,
			_details_second = _e.__candidate_details_second,
			_points_history = []
		;

		//	bad candidate
		if (_e._is__bad) { return [0]; }


		//	get initial points
		//	==================
			_points_history.unshift(_e.__points_history[(_e.__points_history.length-1)]);


        //  candidates, containers, pieces
        //  ==============================
            var
                _divide__pieces =     Math.max(2, Math.ceil(_e._count__pieces *     0.25)),
                _divide__candidates = Math.max(2, Math.ceil(_e._count__candidates * 0.25)),
                _divide__containers = Math.max(4, Math.ceil(_e._count__containers * 0.25))
            ;

            _points_history.unshift(((0
                + (_points_history[0] * 3)
                + ((_points_history[0] / _divide__pieces) * 2)
                + ((_points_history[0] / _divide__candidates) * 2)
                + ((_points_history[0] / _divide__containers) * 2)
            ) / 9));


        //  total text
        //  ==========
            $R.getContent__computePointsForCandidate__do(0.75, 1, (1 - (1 - _details_second._ratio__length__plain_text_to_total_plain_text)), _points_history);
            $R.getContent__computePointsForCandidate__do(0.75, 1, (1 - (1 - _details_second._ratio__count__plain_words_to_total_plain_words)), _points_history);


        //	text above
        //	==========
            $R.getContent__computePointsForCandidate__do(0.50, 1, (1 - _details._ratio__length__above_plain_text_to_total_plain_text), _points_history);
            $R.getContent__computePointsForCandidate__do(0.50, 1, (1 - _details._ratio__count__above_plain_words_to_total_plain_words), _points_history);

            $R.getContent__computePointsForCandidate__do(0.10, 1, (1 - _details_second._ratio__length__above_plain_text_to_total_plain_text), _points_history);
            $R.getContent__computePointsForCandidate__do(0.10, 1, (1 - _details_second._ratio__count__above_plain_words_to_total_plain_words), _points_history);

            $R.getContent__computePointsForCandidate__do(0.10, 1, (1 - _details_second._ratio__length__above_plain_text_to_plain_text), _points_history);
            $R.getContent__computePointsForCandidate__do(0.10, 1, (1 - _details_second._ratio__count__above_plain_words_to_plain_words), _points_history);


        //	links inner
        //	===========
            $R.getContent__computePointsForCandidate__do(0.50, 1, (1 - _details._ratio__length__links_text_to_all_text), _points_history);
            $R.getContent__computePointsForCandidate__do(0.50, 1, (1 - _details._ratio__count__links_words_to_all_words), _points_history);

            $R.getContent__computePointsForCandidate__do(0.50, 1, (1 - _details._ratio__length__links_text_to_plain_text), _points_history);
            $R.getContent__computePointsForCandidate__do(0.50, 1, (1 - _details._ratio__count__links_words_to_plain_words), _points_history);

            $R.getContent__computePointsForCandidate__do(0.50, 1, (1 - _details._ratio__count__links_to_plain_words), _points_history);


        //	candidates, containers, pieces
        //	==============================
            $R.getContent__computePointsForCandidate__do(0.50, 1, (1 - _details._ratio__count__candidates_to_total_candidates), _points_history);
            $R.getContent__computePointsForCandidate__do(0.50, 1, (1 - _details._ratio__count__containers_to_total_containers), _points_history);
            $R.getContent__computePointsForCandidate__do(0.50, 1, (1 - _details._ratio__count__pieces_to_total_pieces), _points_history);


		//	return -- will get [0] as the actual final points
		//	======
			return _points_history;
    };



    $R.getContent__computePointsForCandidate__do = function (_ratio_remaining, _power, _ratio, _points_history)
    {
        var
            _points_remaining = (_points_history[0] * _ratio_remaining),
            _points_to_compute = (_points_history[0] - _points_remaining)
        ;

        if (_ratio < 0)
        {
            //_points_return = (0.75 * _points_remaining);
            _points_return = _points_remaining;
        }
        else
        {
            _points_return = 0
                + _points_remaining
                + (_points_to_compute * Math.pow(_ratio, _power))
            ;
        }

        //	add
        _points_history.unshift(_points_return);
    };



	$R.getContent__buildHTMLForNode = function (_nodeToBuildHTMLFor, _custom_mode)
	{
		var
			_global__element_index = 0,
			_global__the_html = '',
			_global__exploreNodeToBuildHTMLFor = $R.getContent__exploreNodeAndGetStuff(_nodeToBuildHTMLFor, true)
		;

		//	custom
		//	======
		switch (_custom_mode)
		{
			case 'above-the-target':
				_global__exploreNodeToBuildHTMLFor = false;
				break;
		}

		//	recursive function
		//	==================
		var _recursive = function (_node)
		{
			//	increment index -- starts with 1
			//	===============
				_global__element_index++;

			//	vars
			//	====
				var
					_explored = false,
					_tag_name = (_node.nodeType === 3 ? '#text' : ((_node.nodeType === 1 && _node.tagName && _node.tagName > '') ? _node.tagName.toLowerCase() : '#invalid')),
					_pos__start__before = 0,
					_pos__start__after = 0,
					_pos__end__before = 0,
					_pos__end__after = 0
				;

			//	fast return
			//	===========
				switch (true)
				{
					case ((_tag_name == '#invalid')):
					case (($R.parsingOptions._elements_ignore.indexOf('|'+_tag_name+'|') > -1)):
						return;

					case (_tag_name == '#text'):
						_global__the_html += _node.nodeValue
							.replace(/</gi, '&lt;')
							.replace(/>/gi, '&gt;')
						;
						return;
				}

			//	hidden
			//	======
				if ($R.parsingOptions._elements_visible.indexOf('|'+_tag_name+'|') > -1)
					{
	//	included inline
	//	_node, _tag_name must be defined
	//	will return, if node is hidden

	switch (true)
	{
		case (_node.offsetWidth > 0):
		case (_node.offsetHeight > 0):
			break;

		default:
			switch (true)
			{
				case (_node.offsetLeft > 0):
				case (_node.offsetTop > 0):
					break;

				default:
                    //  exclude inline DIVs -- which, stupidly, don't have a width/height
                    if ((_tag_name == 'div') && ((_node.style.display || $.css( _node, "display" )) == 'inline'))
                        { break; }

                    //  it's hidden; exit current scope
					return;
			}
			break;
	}
 }

			//	clean -- before
			//	=====

	//	just a return will skip the whol element
	//	including children

	//	objects, embeds, iframes
	//	========================
		switch (_tag_name)
		{
			case ('object'):
			case ('embed'):
			case ('iframe'):
				var
					_src = (_tag_name == 'object' ? $(_node).find("param[name='movie']").attr('value') : $(_node).attr('src')),
					_skip = ((_src > '') ? false : true)
				;

				if (_skip); else
				{
					//	default skip
					_skip = true;

					//	loop
					for (var i=0, _i=$R.keepStuffFromDomain__video.length; i<_i; i++)
						{ if (_src.indexOf($R.keepStuffFromDomain__video[i]) > -1) { _skip = false; break; } }
				}

				//	skip?
				if (_skip)
					{ $R.debugOutline(_node, 'clean-before', 'object-embed-iframe'); return; }

				break;
		}

	//	skipped link
	//	============
		if (_tag_name == 'a' || _tag_name == 'li')
		{
			_explored = (_explored || $R.getContent__exploreNodeAndGetStuff(_node, true));
			switch (true)
			{
				case (_explored._is__link_skip):
				case (((_explored._count__images_small + _explored._count__images_skip) > 0) && (_explored._length__plain_text < 65)):
					$R.debugOutline(_node, 'clean-before', 'skip-link');
					return;
			}
		}

	//	link density
	//	============
		if ($R.parsingOptions._elements_link_density.indexOf('|'+_tag_name+'|') > -1)
		{
			_explored = (_explored || $R.getContent__exploreNodeAndGetStuff(_node, true));
			switch (true)
			{
                case (_explored._length__plain_text > (65 * 3 * 2)):
                case ($R.language == 'cjk' && (_explored._length__plain_text > (65 * 3 * 1))):
				case (!(_explored._count__links > 1)):
				case (_global__exploreNodeToBuildHTMLFor && (_explored._length__plain_text / _global__exploreNodeToBuildHTMLFor._length__plain_text) > 0.5):
				case (_global__exploreNodeToBuildHTMLFor && (_explored._count__plain_words / _global__exploreNodeToBuildHTMLFor._count__plain_words) > 0.5):
				case ((_explored._length__plain_text == 0) && (_explored._count__links == 1) && (_explored._length__links_text < 65)):
				case ((_explored._length__plain_text < 25) && ((_explored._count__images_large + _explored._count__images_medium) > 0)):
					break;

				case ((_explored._length__links_text / _explored._length__all_text) < 0.5):
					if (_explored._count__links > 0); else { break; }
					if (_explored._count__links_skip > 0); else { break; }
					if (((_explored._count__links_skip / _explored._count__links) > 0.25) && (_explored._length__links_text / _explored._length__all_text) < 0.05) { break; }

				default:
					$R.debugOutline(_node, 'clean-before', 'link-density');
					return;
			}
		}

	//	floating
	//	========
		if ($R.parsingOptions._elements_floating.indexOf('|'+_tag_name+'|') > -1)
		{
			_explored = (_explored || $R.getContent__exploreNodeAndGetStuff(_node, true));
			switch (true)
			{
				case (_explored._length__plain_text > (65 * 3 * 2)):
                case ($R.language == 'cjk' && (_explored._length__plain_text > (65 * 3 * 1))):
				case (_global__exploreNodeToBuildHTMLFor && (_explored._length__plain_text / _global__exploreNodeToBuildHTMLFor._length__plain_text) > 0.25):
				case (_global__exploreNodeToBuildHTMLFor && (_explored._count__plain_words / _global__exploreNodeToBuildHTMLFor._count__plain_words) > 0.25):
				case ((_explored._length__plain_text < 25) && (_explored._length__links_text < 25) && ((_explored._count__images_large + _explored._count__images_medium) > 0)):
				case (_node.getElementsByTagName && (_explored._length__plain_text < (65 * 3 * 1)) && ((_node.getElementsByTagName('h1').length + _node.getElementsByTagName('h2').length + _node.getElementsByTagName('h3').length + _node.getElementsByTagName('h4').length) > 0)):
                    break;

				default:
					var _float = $(_node).css('float');
					if (_float == 'left' || _float == 'right'); else { break; }
					if ((_explored._length__links_text == 0) && ((_explored._count__images_large + _explored._count__images_medium) > 0)) { break; }

					$R.debugOutline(_node, 'clean-before', 'floating');
					return;
			}
		}

	//	above target
	//	============
		if (_custom_mode == 'above-the-target')
		{
            //  is ignored?
			if ($R.parsingOptions._elements_above_target_ignore.indexOf('|'+_tag_name+'|') > -1)
				{ $R.debugOutline(_node, 'clean-before', 'above-target'); return; }

            //  is image?
			if (_tag_name == 'img')
			{
				_explored = (_explored || $R.getContent__exploreNodeAndGetStuff(_node, true));
				if (_explored._is__image_large); else
					{ $R.debugOutline(_node, 'clean-before', 'above-target'); return; }
			}

            //  has too many links?
            //if (_node.getElementsByTagName && _node.getElementsByTagName('a').length > 5)
            //    { $R.debugOutline(_node, 'clean-before', 'above-target'); return; }
		}

    //  headers that are images
    //  =======================
		if (_tag_name.match(/^h(1|2|3|4|5|6)$/gi))
		{
			_explored = (_explored || $R.getContent__exploreNodeAndGetStuff(_node, true));
			switch (true)
			{
				case ((_explored._length__plain_text < 10) && ((_explored._count__images_small + _explored._count__images_medium + _explored._count__images_large + _explored._count__images_skip) > 0)):
					$R.debugOutline(_node, 'clean-before', 'skip-heading');
					return;
			}
		}


			//	start tag
			//	=========
				if ($R.parsingOptions._elements_ignore_tag.indexOf('|'+_tag_name+'|') > -1); else
				{
					/* mark */	_pos__start__before = _global__the_html.length;
					/* add */	_global__the_html += '<'+_tag_name;

					//	attributes
					//	==========

	//	allowed attributes
	//	==================
		if (_tag_name in $R.parsingOptions._elements_keep_attributes)
		{
			for (var i=0, _i=$R.parsingOptions._elements_keep_attributes[_tag_name].length; i<_i; i++)
			{
				var
					_attribute_name = $R.parsingOptions._elements_keep_attributes[_tag_name][i],
					_attribute_value = _node.getAttribute(_attribute_name)
				;

				//	if present
				if (_attribute_value > '')
					{ _global__the_html += ' '+_attribute_name+'="'+(_attribute_value)+'"'; }
			}
		}

	//	keep ID for all elements
	//	========================
		var _id_attribute = _node.getAttribute('id');
		if (_id_attribute > '')
			{ _global__the_html += ' id="'+_id_attribute+'"'; }

	//	links target NEW
	//	================
		if (_tag_name == 'a')
			{ _global__the_html += ' target="_blank"'; }


					//	close start
					//	===========
						if ($R.parsingOptions._elements_self_closing.indexOf('|'+_tag_name+'|') > -1) { _global__the_html += ' />'; }
						else { _global__the_html += '>';}

					/* mark */ _pos__start__after = _global__the_html.length;
				}

			//	child nodes
			//	===========
				if ($R.parsingOptions._elements_self_closing.indexOf('|'+_tag_name+'|') > -1); else
				{
					for (var i=0, _i=_node.childNodes.length; i<_i; i++)
						{ _recursive(_node.childNodes[i]); }
				}

			//	end tag
			//	=======
				switch (true)
				{
					case (($R.parsingOptions._elements_ignore_tag.indexOf('|'+_tag_name+'|') > -1)):
						return;

					case (($R.parsingOptions._elements_self_closing.indexOf('|'+_tag_name+'|') > -1)):
						/* mark */ 	_pos__end__before = _global__the_html.length;
						/* mark */ 	_pos__end__after = _global__the_html.length;
						break;

					default:
						/* mark */ 	_pos__end__before = _global__the_html.length;
						/* end */ 	_global__the_html += '</'+_tag_name+'>';
						/* mark */ 	_pos__end__after = _global__the_html.length;
						break;
				}

			//	clean -- after
			//	=====

	//	we need to actually cut things out of
	//	"_global__the_html", for stuff to not be there


	//	largeObject classes
	//	===================
		if (_tag_name == 'iframe' || _tag_name == 'embed' || _tag_name == 'object')
		{
			_global__the_html = ''
				+ _global__the_html.substr(0, _pos__start__before)
				+ '<div class="readableLargeObjectContainer">'
				+ 	_global__the_html.substr(_pos__start__before, (_pos__end__after - _pos__start__before))
				+ '</div>'
			;
			return;
		}

	//	add image classes
	//	=================
		if (_tag_name == 'img')
		{
			_explored = (_explored || $R.getContent__exploreNodeAndGetStuff(_node, true));
			switch (true)
			{
				case (_explored._is__image_skip):
					$R.debugOutline(_node, 'clean-after', 'skip-img');
					_global__the_html = _global__the_html.substr(0, _pos__start__before);
					return;

				case (_explored._is__image_large):

                    //  add float class -- for images too narrow/tall
                    //  remove width/height -- only for large images

                    //  http://www.wired.com/threatlevel/2011/05/gps-gallery/?pid=89&viewall=true
                    //  http://david-smith.org/blog/2012/03/10/ios-5-dot-1-upgrade-stats/index.html
                    //  http://www.turntablekitchen.com/2012/04/dutch-baby-with-caramelized-vanilla-bean-pears-moving-through-the-decades/

                    _global__the_html = ''
						+ _global__the_html.substr(0, _pos__start__before)
						+ '<div class="readableLargeImageContainer'
						+ 	(($(_node).width() <= 250) && ($(_node).height() >= 250) ? ' float' : '')
						+ '">'
						+ 	_global__the_html.substr(_pos__start__before, (_pos__end__after - _pos__start__before)).replace(/width="([^=]+?)"/gi, '').replace(/height="([^=]+?)"/gi, '')
						+ '</div>'
					;
					return;
			}
		}

	//	large images in links
	//	=====================
		if (_tag_name == 'a')
		{
			_explored = (_explored || $R.getContent__exploreNodeAndGetStuff(_node, true));
			switch (true)
			{
				case (_explored._count__images_large == 1):
					_global__the_html = ''
						+ _global__the_html.substr(0, _pos__start__after-1)
						+ ' class="readableLinkWithLargeImage">'
						+ 	_global__the_html.substr(_pos__start__after, (_pos__end__before - _pos__start__after))
						+ '</a>'
					;
					return;

				case (_explored._count__images_medium == 1):
					_global__the_html = ''
						+ _global__the_html.substr(0, _pos__start__after-1)
						+ ' class="readableLinkWithMediumImage">'
						+ 	_global__the_html.substr(_pos__start__after, (_pos__end__before - _pos__start__after))
						+ '</a>'
					;
					return;
			}
		}

	//	too much content
	//	================
		if ($R.parsingOptions._elements_too_much_content.indexOf('|'+_tag_name+'|') > -1)
		{
			_explored = (_explored || $R.getContent__exploreNodeAndGetStuff(_node, true));
			switch (true)
			{
				case (_tag_name == 'h1' && (_explored._length__all_text > (65 * 2))):
				case (_tag_name == 'h2' && (_explored._length__all_text > (65 * 2 * 3))):
				case ((_tag_name.match(/^h(3|4|5|6)$/) != null) && (_explored._length__all_text > (65 * 2 * 5))):
				case ((_tag_name.match(/^(b|i|em|strong)$/) != null) && (_explored._length__all_text > (65 * 5 * 5))):
					$R.debugOutline(_node, 'clean-after', 'too-much-content');
					_global__the_html = ''
						+ _global__the_html.substr(0, _pos__start__before)
						+ _global__the_html.substr(_pos__start__after, (_pos__end__before - _pos__start__after))
					;
					return;
			}
		}

	//	empty elements
	//	==============
		switch (true)
		{
			case (($R.parsingOptions._elements_self_closing.indexOf('|'+_tag_name+'|') > -1)):
			case (($R.parsingOptions._elements_ignore_tag.indexOf('|'+_tag_name+'|') > -1)):
			case (_tag_name == 'td'):
				break;

			default:
				var _contents = _global__the_html.substr(_pos__start__after, (_pos__end__before - _pos__start__after));
					_contents = _contents.replace(/(<br \/>)/gi, '');
					_contents = _contents.replace(/(<hr \/>)/gi, '');

                    //  for rows, clear empty cells
                    if (_tag_name == 'tr')
                    {
                        _contents = _contents.replace(/<td[^>]*?>/gi, '');
                        _contents = _contents.replace(/<\/td>/gi, '');
                    }

                    //  for tables, clear empty rows
                    if (_tag_name == 'table')
                    {
                        _contents = _contents.replace(/<tr[^>]*?>/gi, '');
                        _contents = _contents.replace(/<\/tr>/gi, '');
                    }

				var _contentsLength = $R.measureText__getTextLength(_contents);

				switch (true)
				{
					case (_contentsLength == 0 && _tag_name == 'p'):
						_global__the_html = _global__the_html.substr(0, _pos__start__before) + '<br /><br />';
						return;

					case (_contentsLength == 0):
					case ((_contentsLength < 5) && ($R.parsingOptions._elements_visible.indexOf('|'+_tag_name+'|') > -1)):
						$R.debugOutline(_node, 'clean-after', 'blank');
						_global__the_html = _global__the_html.substr(0, _pos__start__before);
						return;
				}
				break;
		}

	//	too much missing
	//	================
		if ($R.parsingOptions._elements_link_density.indexOf('|'+_tag_name+'|') > -1)
		{
			_explored = (_explored || $R.getContent__exploreNodeAndGetStuff(_node, true));
			var
				_contents = _global__the_html
							.substr(_pos__start__after, (_pos__end__before - _pos__start__after))
								.replace(/(<([^>]+)>)/gi, ''),
				_contentsLength = $R.measureText__getTextLength(_contents),
				_initialLength = 0
					+ _explored._length__all_text
					+ (_explored._count__images_small 					* 10)
					+ (_explored._count__images_skip 					* 10)
					+ (_node.getElementsByTagName('iframe').length 		* 10)
					+ (_node.getElementsByTagName('object').length 		* 10)
					+ (_node.getElementsByTagName('embed').length 		* 10)
					+ (_node.getElementsByTagName('button').length 		* 10)
					+ (_node.getElementsByTagName('input').length 		* 10)
					+ (_node.getElementsByTagName('select').length 		* 10)
					+ (_node.getElementsByTagName('textarea').length 	* 10)
			;

			//	too much missing
			switch (true)
			{
				case (!(_contentsLength > 0)):
				case (!(_initialLength > 0)):
				case (!((_contentsLength / _initialLength) < 0.5)):
				case (!(($R.language == 'cjk') && (_contentsLength / _initialLength) < 0.1)):
				case ((_global__exploreNodeToBuildHTMLFor && ((_explored._length__plain_text / _global__exploreNodeToBuildHTMLFor._length__plain_text) > 0.25))):
				case (($R.language == 'cjk') && (_global__exploreNodeToBuildHTMLFor && ((_explored._length__plain_text / _global__exploreNodeToBuildHTMLFor._length__plain_text) > 0.1))):
					break;

				default:
					$R.debugOutline(_node, 'clean-after', 'missing-density');
					_global__the_html = _global__the_html.substr(0, _pos__start__before);
					return;
			}
		}


			//	return
				return;
		};

		//	actually do it
		_recursive(_nodeToBuildHTMLFor);

		//	return html
		return _global__the_html;
	};



    //  article title marker
    //  ====================
    $R.articleTitleMarker__start = '<div id="articleHeader"><h1>';
    $R.articleTitleMarker__end = '</h1></div>';


    //  article title check function
    //  ============================
    $R.getContent__find__hasIsolatedTitleInHTML = function (_html)
    {
        return (_html.substr(0, $R.articleTitleMarker__start.length) == $R.articleTitleMarker__start);
    };


    //  article title get function
    //  ============================
    $R.getContent__find__getIsolatedTitleInHTML = function (_html)
    {
        //  is it there?
        if ($R.getContent__find__hasIsolatedTitleInHTML(_html)); else { return ''; }

        //  regex
        var
            _getTitleRegex = new RegExp($R.articleTitleMarker__start + '(.*?)' + $R.articleTitleMarker__end, 'i'),
            _getTitleMatch = _html.match(_getTitleRegex)
        ;

        //  match?
        if (_getTitleMatch); else { return ''; }

        //  return
        return _getTitleMatch[1];
    };


    //  find title in arbitrary html
    //  ============================
    $R.getContent__find__isolateTitleInHTML = function (_html, _document_title)
    {
        //  can't just use (h1|h2|h3|etc) -- we want to try them in a certain order
        //  =============================
        var
            _heading_pregs = [
                /<(h1)[^>]*?>([\s\S]+?)<\/\1>/gi,
                /<(h2)[^>]*?>([\s\S]+?)<\/\1>/gi,
                /<(h3|h4|h5|h6)[^>]*?>([\s\S]+?)<\/\1>/gi
            ],
            _secondary_headings = '|h2|h3|h4|h5|h6|',
            _search_document_title = ' ' + _document_title.replace(/<[^>]+?>/gi, '').replace(/\s+/gi, ' ') + ' '
        ;

        //  loop pregs
        //  ==========
        for (var i=0, _i=_heading_pregs.length; i<_i; i++)
        {
            //  exec
            var _match = _heading_pregs[i].exec(_html);

            //  return?
            switch (true)
            {
                case (!(_match)):
                case (!(_heading_pregs[i].lastIndex > -1)):
                    //  will continue loop
                    break;

                default:

                    //  measurements
                    var
                        _heading_end_pos = _heading_pregs[i].lastIndex,
                        _heading_start_pos = (_heading_end_pos - _match[0].length),

                        _heading_type = _match[1],
                        _heading_text = _match[2].replace(/<\s*br[^>]*>/gi, '').replace(/[\n\r]+/gi, ''),
                        _heading_text_plain = _heading_text.replace(/<[^>]+?>/gi, '').replace(/\s+/gi, ' ');
                        _heading_length = $R.measureText__getTextLength(_heading_text_plain),
                        _heading_words = [],

                        _to_heading_text = _html.substr(0, _heading_start_pos),
                        _to_heading_length = $R.measureText__getTextLength(_to_heading_text.replace(/<[^>]+?>/gi, '').replace(/\s+/gi, ' '))
                    ;

                    //  return?
                    switch (true)
                    {
                        case (!(_heading_length > 5)):
                        case (!(_heading_length < (65 * 3))):
                        case (!(_to_heading_length < (65 * 3 * 2))):
                            //  will continue for loop
                            break;

                        case ((_secondary_headings.indexOf('|' + _heading_type + '|') > -1)):
                            //  words in this heading
                            _heading_words = _heading_text_plain.split(' ');

                            //  count words present in title
                            for (var j=0, _j=_heading_words.length, _matched_words=''; j<_j; j++) {
                                if (_search_document_title.indexOf(' ' + _heading_words[j] + ' ') > -1) {
                                    _matched_words += _heading_words[j] + ' ';
                                }
                            }

                            //  break continues for loop
                            //  nothing goes to switch's default
                            //  ================================

                                //  no break?
                                var _no_break = false;
                                switch (true)
                                {
                                    //  if it's big enough, and it's a substring of the title, it's good
                                    case ((_heading_length > 20) && (_search_document_title.indexOf(_heading_text_plain) > -1)):

                                    //  if it's slightly smaler, but is exactly at the begging or the end
                                    case ((_heading_length > 10) && ((_search_document_title.indexOf(_heading_text_plain) == 1) || (_search_document_title.indexOf(_heading_text_plain) == (_search_document_title.length - 1 - _heading_text_plain.length)))):

                                        _no_break = true;
                                        break;
                                }

                                //  break?
                                var _break = false;
                                switch (true)
                                {
                                    //  no break?
                                    case (_no_break):
                                        break;


                                    // heading too long? -- if not h2
                                    case ((_heading_length > ((_search_document_title.length - 2) * 2)) && (_heading_type != 'h2')):

                                    //  heading long enough?
                                    case ((_heading_length < Math.ceil((_search_document_title.length - 2) * 0.50))):

                                    //  enough words matched?
                                    case ((_heading_length < 25) && (_matched_words.length < Math.ceil(_heading_length * 0.75))):
                                    case ((_heading_length < 50) && (_matched_words.length < Math.ceil(_heading_length * 0.65))):
                                    case ((_matched_words.length < Math.ceil(_heading_length * 0.55))):

                                        _break = true;
                                        break;
                                }

                                //  break?
                                if (_break) { break; }


                        default:
                            //  this is the title -- do isolation; return
                            //  =================
                            return ''

                                + $R.articleTitleMarker__start
                                +   _heading_text
                                + $R.articleTitleMarker__end

                                + $R.getContent__find__isolateTitleInHTML__balanceDivsAtStart(_html.substr(_heading_end_pos))
                            ;
                    }

                    break;
            }
        }

        //  return unmodified
        return _html;
    };

    $R.getContent__find__isolateTitleInHTML__balanceDivsAtStart__substrCount = function (_haystack, _needle, _offset, _length)
    {
        // http://kevin.vanzonneveld.net
        // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // +   bugfixed by: Onno Marsman
        // +   improved by: Brett Zamir (http://brett-zamir.me)
        // +   improved by: Thomas
        // *     example 1: substr_count('Kevin van Zonneveld', 'e');
        // *     returns 1: 3
        // *     example 2: substr_count('Kevin van Zonneveld', 'K', 1);
        // *     returns 2: 0
        // *     example 3: substr_count('Kevin van Zonneveld', 'Z', 0, 10);
        // *     returns 3: false

        var cnt = 0;

        _haystack += '';
        _needle += '';
        if (isNaN(_offset)) { _offset = 0; }
        if (isNaN(_length)) { _length = 0; }
        if (_needle.length == 0) { return false; }

        _offset--;

        while ((_offset = _haystack.indexOf(_needle, _offset + 1)) != -1) {
            if (_length > 0 && (_offset + _needle.length) > _length) {
                return false;
            }
            cnt++;
        }

        return cnt;
    };

    $R.getContent__find__isolateTitleInHTML__balanceDivsAtStart = function (_html)
    {
        //  easy; remove all </X> at begining
        var
            _h = _html.replace(/^(\s*<\s*\/\s*[^>]+>)+/gi, ''),
            _r = /<\s*\/\s*([^\s>]+?)[^>]*>/gi,
            _the_end_tag = '</div>',
            _the_start_tag = '<div',
            _end_tag_pos = -1,
            _last_pos = 0
        ;

        //  remove all unbalanced _end_tags
        for (var _i=0; _i<100; _i++)
        {
            _end_tag_pos = _h.indexOf(_the_end_tag, _last_pos);
            if (_end_tag_pos > -1); else { break; }

            var
                _sub = _h.substr(0, _end_tag_pos),
                _start_tags = $R.getContent__find__isolateTitleInHTML__balanceDivsAtStart__substrCount(_sub, _the_start_tag, _last_pos),
                _end_tags = ((_start_tags > 0) ? (1 + $R.getContent__find__isolateTitleInHTML__balanceDivsAtStart__substrCount(_sub, _the_end_tag, _last_pos)) : false)
            ;

            if ((!(_start_tags > 0)) || (_start_tags < _end_tags))
            {
                _h = ''
                    + _h.substr(0, _end_tag_pos)
                    + _h.substr(_end_tag_pos + _the_end_tag.length)
                ;

                _last_pos = _end_tag_pos;
            }
            else
            {
                _last_pos = _end_tag_pos + 1;
            }
        }

        $R.log(_h);

        return _h;
    };


	$R.getContent__find = function ()
	{
		//	get content
		//	===========
			var
				_found = $R.getContent__findInPage($R.win),
				_targetNode = _found._targetCandidate.__node,
				_$targetNode = $(_targetNode),
                _aboveNodes = []
			;

		//	RTL
		//	===
			switch (true)
			{
				case (_$targetNode.attr('dir') == 'rtl'):
				case (_$targetNode.css('direction') == 'rtl'):
					$R.makeRTL();
					break;
			}

		//  get html
        //  ========
            var
                _foundHTML = _found._html,
                _firstFragmentBefore = $R.getContent__nextPage__getFirstFragment(_foundHTML),
                _documentTitle = ($R.document.title > '' ? $R.document.title : '')
            ;

        //  get title
        //  =========

            //  has title already?
            _foundHTML = $R.getContent__find__isolateTitleInHTML(_foundHTML, _documentTitle);
            $R.articleTitle = $R.getContent__find__getIsolatedTitleInHTML(_foundHTML);
            $R.debugPrint('TitleSource', 'target');

            //  get html above?
            if ($R.articleTitle > ''); else
            {

    //  get html above target?
    //  ======================

    //  global vars:
    //      _found
    //      _foundHTML
    //      _documentTitle
    //      _aboveNodes

    var
        _prevNode = _found._targetCandidate.__node,
        _prevHTML = '',
        _aboveHTML = '',
        _differentTargets = (_found._firstCandidate.__node != _found._targetCandidate.__node)
    ;

    (function ()
    {

        while (true)
        {
            //  the end?
            switch (true)
            {
                case (_prevNode.tagName && (_prevNode.tagName.toLowerCase() == 'body')):
                case (_differentTargets && (_prevNode == _found._firstCandidate.__node)):
                    //  enough is enough
                    return;
            }

            //  up or sideways?
            if (_prevNode.previousSibling); else
            {
                _prevNode = _prevNode.parentNode;
                continue;
            }

            //	previous
            _prevNode = _prevNode.previousSibling;

            //	outline -- element might be re-outlined, when buildHTML is invoked
            if ($R.debug) { $R.debugOutline(_prevNode, 'target', 'add-above'); }

            //	get html; add
            _prevHTML = $R.getContent__buildHTMLForNode(_prevNode, 'above-the-target');
            _aboveHTML = _prevHTML + _aboveHTML;
            _aboveNodes.unshift(_prevNode);

            //  isolate title
            _aboveHTML = $R.getContent__find__isolateTitleInHTML(_aboveHTML, _documentTitle);

            //	finished?
            switch (true)
            {
                case ($R.measureText__getTextLength(_aboveHTML.replace(/<[^>]+?>/gi, '').replace(/\s+/gi, ' ')) > (65 * 3 * 3)):
                case ($R.getContent__find__hasIsolatedTitleInHTML(_aboveHTML)):
                    return;
            }
        }

    })();


    //  is what we found any good?
    //  ==========================
    switch (true)
    {
        case ($R.getContent__find__hasIsolatedTitleInHTML(_aboveHTML)):
        case (_differentTargets && (_aboveHTML.split('<a ').length < 3) && ($R.measureText__getTextLength(_aboveHTML.replace(/<[^>]+?>/gi, '').replace(/\s+/gi, ' ')) < (65 * 3))):
            _foundHTML = _aboveHTML + _foundHTML;
            break;

        default:
            _aboveHTML = '';
            _aboveNodes = [];
            break;
    }

                $R.articleTitle = $R.getContent__find__getIsolatedTitleInHTML(_foundHTML);
                $R.debugPrint('TitleSource', 'above_HTML');

                //  get document title?
                if ($R.articleTitle > ''); else
                {

    //  if all else failed, get document title
    //  ======================================

    //  global vars:
    //      _foundHTML
    //      _documentTitle

    (function ()
    {
        //  return?
        //  =======
            if (_documentTitle > ''); else { return; }

        //  vars
            var
                _doc_title_parts = [],
                _doc_title_pregs =
                [
                    /( [-][-] |( [-] )|( [>][>] )|( [<][<] )|( [|] )|( [\/] ))/i,
                    /(([:] ))/i
                ]
            ;

        //	loop through pregs
        //  ==================
            for (var i=0, _i=_doc_title_pregs.length; i<_i; i++)
            {
                //	split
                _doc_title_parts = _documentTitle.split(_doc_title_pregs[i]);

                //	break if we managed a split
                if (_doc_title_parts.length > 1) { break; }
            }

        //	sort title parts -- longer goes higher up -- i.e. towards 0
        //	================
            _doc_title_parts.sort(function (a, b)
            {
                switch (true)
                {
                    case (a.length > b.length): return -1;
                    case (a.length < b.length): return 1;
                    default: return 0;
                }
            });

        //	set title -- first part, if more than one word; otherwise, whole
        //  =========
            _foundHTML = ''

                + $R.articleTitleMarker__start
                +   (_doc_title_parts[0].split(/\s+/i).length > 1 ? _doc_title_parts[0] : _documentTitle)
                + $R.articleTitleMarker__end

                + _foundHTML
            ;

    })();
                    $R.articleTitle = $R.getContent__find__getIsolatedTitleInHTML(_foundHTML);
                    $R.debugPrint('TitleSource', 'document_title');
                }
            }

		//	display
		//	=======
			$R.$pages.html('');
			$R.displayPageHTML(_foundHTML, 1, $R.win.location.href);

		//	remember
		//	========
			$R.debugRemember['theTarget'] = _found._targetCandidate.__node;
			$R.debugRemember['firstCandidate'] = _found._firstCandidate.__node;

		//	next
		//	====
            $R.nextPage__firstFragment__firstPage = _firstFragmentBefore;
            $R.nextPage__firstFragment__lastPage = $R.getContent__nextPage__getFirstFragment(_foundHTML);;

			$R.nextPage__loadedPages = [$R.win.location.href];
			$R.getContent__nextPage__find($R.win, _found._links);

		//	return
		return true;
	};


	$R.getContent__findInPage = function (_pageWindow)
	{
		//	calculations
		//	============

			var
				_firstCandidate = false,
				_secondCandidate = false,
				_targetCandidate = false
			;

			$R.debugTimerStart('ExploreAndGetStuff');
				var	_stuff = $R.getContent__exploreNodeAndGetStuff(_pageWindow.document.body);
			$R.debugPrint('ExploreAndGetStuff', $R.debugTimerEnd()+'ms');

			$R.debugTimerStart('ProcessFirst');
				var _processedCandidates = $R.getContent__processCandidates(_stuff._candidates);
				_firstCandidate = _processedCandidates[0];
				_targetCandidate = _firstCandidate;
			$R.debugPrint('ProcessFirst', $R.debugTimerEnd()+'ms');

            //  debug
			if ($R.debug)
			{
                //  debug first candidates
                $R.log('First 5 Main Candidates:');
				for (var x in _processedCandidates)
                {
                    if (x == 5) { break; }
                    $R.log(_processedCandidates[x], _processedCandidates[x].__node);
                }

                //  highlight first
                $R.debugOutline(_firstCandidate.__node, 'target', 'first');
            }

            //  in case we stop
            $R.debugPrint('Target', 'first');


			//  do second?
			switch (true)
			{
				case (!(_firstCandidate._count__containers > 0)):
				case (!(_firstCandidate._count__candidates > 0)):
				case (!(_firstCandidate._count__pieces > 0)):
				case (!(_firstCandidate._count__containers > 25)):
					break;

				default:

                    $R.debugTimerStart('ProcessSecond');
                        var _processedCandidatesSecond = $R.getContent__processCandidatesSecond(_processedCandidates);
                        _secondCandidate = _processedCandidatesSecond[0];
                    $R.debugPrint('ProcessSecond', $R.debugTimerEnd()+'ms');

                    //  they're the same
                    if (_firstCandidate.__node == _secondCandidate.__node) { break; }

                    //  debug
                    if ($R.debug)
                    {
                        //  log second candidates
                        $R.log('First 5 Second Candidates:');
                        for (var x in _processedCandidatesSecond)
                        {
                            if (x == 5) { break; }
                            $R.log(_processedCandidatesSecond[x], _processedCandidatesSecond[x].__node);
                        }

                        //  highlight second
                        $R.debugOutline(_secondCandidate.__node, 'target', 'second');
                    }


                    //  compute again
                    //  =============
                        _firstCandidate['__points_history_final'] = $R.getContent__computePointsForCandidateThird(_firstCandidate, _firstCandidate);
                        _firstCandidate['__points_final'] = _firstCandidate.__points_history_final[0];

                        _secondCandidate['__points_history_final'] = $R.getContent__computePointsForCandidateThird(_secondCandidate, _firstCandidate);
                        _secondCandidate['__points_final'] = _secondCandidate.__points_history_final[0];


                    //  log results
                    //  ===========
                        if ($R.debug)
                        {
                            $R.log('The 2 Candidates:');
                            $R.log(_firstCandidate);
                            $R.log(_secondCandidate);
                        }


                    //  are we selecting _second?
                    //  =========================
                        switch (true)
                        {
                            case ((_secondCandidate.__candidate_details._count__lines_of_65_characters < 20) && (_secondCandidate.__points_final / _firstCandidate.__points_final) > 1):
                            case ((_secondCandidate.__candidate_details._count__lines_of_65_characters > 20) && (_secondCandidate.__points_final / _firstCandidate.__points_final) > 0.9):
                            case ((_secondCandidate.__candidate_details._count__lines_of_65_characters > 50) && (_secondCandidate.__points_final / _firstCandidate.__points_final) > 0.75):
                                _targetCandidate = _secondCandidate;
                                $R.debugPrint('Target', 'second');
                                break;
                        }


                    //  print points
                    //  ============
                        if ($R.debug)
                        {
                            $R.debugPrint('PointsFirst', _firstCandidate['__points_history_final'][0].toFixed(2));
                            $R.debugPrint('PointsSecond', _secondCandidate['__points_history_final'][0].toFixed(2));
                        }

					break;
			}

            //  highlight target
            //  ================
                if ($R.debug)
                {
                    $(_targetCandidate.__node).css({
                        'box-shadow':
                            'inset 0px 0px 50px rgba(255, 255, 0, 0.95), 0px 0px 50px rgba(255, 255, 0, 0.95)'
                    });
                }

		//	get html
		//	========
			$R.debugTimerStart('BuildHTML');
				var _html = $R.getContent__buildHTMLForNode(_targetCandidate.__node, 'the-target');
					_html = _html.substr((_html.indexOf('>')+1))
                    _html = _html.substr(0, _html.lastIndexOf('<'));
			$R.debugPrint('BuildHTML', $R.debugTimerEnd()+'ms');

			$R.debugTimerStart('BuildHTMLPregs');
				_html = _html.replace(/<(blockquote|div|p|td|li)([^>]*)>(\s*<br \/>)+/gi, '<$1$2>');
				_html = _html.replace(/(<br \/>\s*)+<\/(blockquote|div|p|td|li)>/gi, '</$2>');
				_html = _html.replace(/(<br \/>\s*)+<(blockquote|div|h\d|ol|p|table|ul|li)([^>]*)>/gi, '<$2$3>');
				_html = _html.replace(/<\/(blockquote|div|h\d|ol|p|table|ul|li)>(\s*<br \/>)+/gi, '</$1>');
				_html = _html.replace(/(<hr \/>\s*<hr \/>\s*)+/gi, '<hr />');
				_html = _html.replace(/(<br \/>\s*<br \/>\s*)+/gi, '<br /><br />');
			$R.debugPrint('BuildHTMLPregs', $R.debugTimerEnd()+'ms');

		//	return
		//	======
			return {
				'_html': _html,
				'_links': _stuff._links,
				'_targetCandidate': _targetCandidate,
				'_firstCandidate': _firstCandidate
			};
	};



    //  get first page fragment
    //  =======================

        $R.getContent__nextPage__getFirstFragment = function (_html)
        {
            //  remove all tags
            _html = _html.replace(/<[^>]+?>/gi, '');

            //  normalize spaces
            _html = _html.replace(/\s+/gi, ' ');

            //  return first 1000 characters
            return _html.substr(0, 2000);
        };


    //  get link parts
    //  ==============

        //  substr starting with the first slash after //
		$R.getURLPath = function (_url)
		{
			return _url.substr(_url.indexOf('/', (_url.indexOf('//') + 2)));
		};

        //  substr until the first slash after //
		$R.getURLDomain = function (_url)
		{
			return _url.substr(0, _url.indexOf('/', (_url.indexOf('//') + 2)))
		};


	//	find
	//	====
		$R.getContent__nextPage__find = function (_currentPageWindow, _linksInCurrentPage)
		{
			//	page id
				var _pageNr = ($R.nextPage__loadedPages.length + 1);

			//	get
			//	===
				var _possible = [];
				if (_possible.length > 0); else { _possible = $R.getContent__nextPage__find__possible(_currentPageWindow, _linksInCurrentPage, 0.5); }
				//if (_possible.length > 0); else { _possible = $R.getContent__nextPage__find__possible(_currentPageWindow, _linksInCurrentPage, 0.50); }

				//	none
				if (_possible.length > 0); else
					{ if ($R.debug) { $R.log('no next link found'); } return; }

				if ($R.debug) { $R.log('possible next', _possible); }

			//	the one
			//	=======
				var _nextLink = false;

			//	next keyword?
			//	=============
				(function ()
				{
					if (_nextLink) { return; }

					for (var i=0, _i=_possible.length; i<_i; i++)
					{
						for (var j=0, _j=$R.nextPage__captionKeywords.length; j<_j; j++)
						{
							if (_possible[i]._caption.indexOf($R.nextPage__captionKeywords[j]) > -1)
							{
								//	length
								//	======
									if (_possible[i]._caption.length > $R.nextPage__captionKeywords[j].length * 2)
										{ continue; }

								//	not keywords
								//	============
									for (var z=0, _z=$R.nextPage__captionKeywords__not.length; z<_z; z++)
									{
										if (_possible[i]._caption.indexOf($R.nextPage__captionKeywords__not[z]) > -1)
											{ _nextLink = false; return; }
									}

								//	got it
								//	======
									_nextLink = _possible[i];
									return;
							}
						}
					}
				})();

			//	caption matched page number
			//	===========================
				(function ()
				{
					if (_nextLink) { return; }

					for (var i=0, _i=_possible.length; i<_i; i++)
					{
						if (_possible[i]._caption == (''+_pageNr))
							{ _nextLink = _possible[i]; return; }
					}
				})();

			//	next keyword in title
			//	=====================
				(function ()
				{
					if (_nextLink) { return; }

					for (var i=0, _i=_possible.length; i<_i; i++)
					{
						//	sanity
						if (_possible[i]._title > ''); else { continue; }
						if ($R.measureText__getTextLength(_possible[i]._caption) <= 2); else { continue; }

						for (var j=0, _j=$R.nextPage__captionKeywords.length; j<_j; j++)
						{
							if (_possible[i]._title.indexOf($R.nextPage__captionKeywords[j]) > -1)
							{
								//	length
								//	======
									if (_possible[i]._title.length > $R.nextPage__captionKeywords[j].length * 2)
										{ continue; }

								//	not keywords
								//	============
									for (var z=0, _z=$R.nextPage__captionKeywords__not.length; z<_z; z++)
									{
										if (_possible[i]._title.indexOf($R.nextPage__captionKeywords__not[z]) > -1)
											{ _nextLink = false; return; }
									}

								//	got it
								//	======
									_nextLink = _possible[i];
									return;
							}
						}
					}
				})();

			//	return?
			//	=======
				if (_nextLink); else { return; }

			//	mark
			//	====
				$R.debugPrint('NextPage', 'true');

				if ($R.debug)
				{
					$R.debugOutline(_nextLink._node, 'target', 'next-page');
					$R.log('NextPage Link', _nextLink, _nextLink._node);
				}

			//	process page
			//	============
				$R.getContent__nextPage__loadToFrame(_pageNr, _nextLink._href);
				$R.nextPage__loadedPages.push(_nextLink._href);
		};


	//	find with similarity
	//	====================
		$R.getContent__nextPage__find__possible = function (_currentPageWindow, _linksInCurrentPage, _distanceFactor)
		{
			var
				_mainPageHref = $R.win.location.href,
				_mainPageDomain = $R.getURLDomain(_mainPageHref),
				_mainPagePath = $R.getURLPath(_mainPageHref)
			;

			var _links = $.map
			(
				_linksInCurrentPage,
				function (_element, _index)
				{
					var
						_href = _element.__node.href,
						_path = $R.getURLPath(_href),
						_title = (_element.__node.title > '' ? _element.__node.title.toLowerCase() : ''),
						_caption = _element.__node.innerHTML.replace(/<[^>]+?>/gi, '').replace(/\&[^\&\s;]{1,10};/gi, '').replace(/\s+/gi, ' ').replace(/^ /, '').replace(/ $/, '').toLowerCase(),
						_distance = $R.levenshteinDistance(_mainPagePath, _path)
					;

					var _caption2 = '';
					for (var i=0, _i=_caption.length, _code=0; i<_i; i++)
					{
						_code = _caption.charCodeAt(i);
						_caption2 += (_code > 127 ? ('&#'+_code+';') : _caption.charAt(i));
					}
					_caption = _caption2;

					switch (true)
					{
						case (!(_href > '')):
						case (_mainPageHref.length > _href.length):
						case (_mainPageDomain != $R.getURLDomain(_href)):
						case (_href.substr(_mainPageHref.length).substr(0, 1) == '#'):
						case (_distance > Math.ceil(_distanceFactor * _path.length)):
							return null;

						default:
							//	skip if already loaded as next page
							for (var i=0, _i=$R.nextPage__loadedPages.length; i<_i; i++)
								{ if ($R.nextPage__loadedPages[i] == _href) { return null; } }

							//	return
							return {
								'_node': _element.__node,
								'_href': _href,
								'_title': _title,
								'_caption': _caption,
								'_distance': _distance
							};
					}
				}
			);

			//	sort -- the less points, the closer to position 0
			//	====
				_links.sort(function (a, b)
				{
					switch (true)
					{
						case (a._distance < b._distance): return -1;
						case (a._distance > b._distance): return 1;
						default: return 0;
					}
				});


			//	return
				return _links;
		};




	//	load to frame
	//	=============
		$R.getContent__nextPage__loadToFrame = function (_pageNr, _nextPageURL)
		{
			//	do ajax
			//	=======
				$.ajax
				({
					'url' : _nextPageURL,

					'type' : 'GET',
					'dataType' : 'html',
					'async' : true,
					'timeout': (10 * 1000),

                     beforeSend: function ( xhr ) {
                        xhr.overrideMimeType("text/html;charset=" + $R.document.characterSet);
                     },
					//'headers': { 'Referrer': _nextPageURL },

					'success' : function (_response, _textStatus, _xhr)	{ $R.getContent__nextPage__ajaxComplete(_pageNr, _response, _textStatus, _xhr); },
					'error' : 	function (_xhr, _textStatus, _error)	{ $R.getContent__nextPage__ajaxError(_pageNr, _xhr, _textStatus, _error); }
				});
		};


	//	ajax calbacks
	//	=============
		$R.getContent__nextPage__ajaxError = function (_pageNr, _xhr, _textStatus, _error)
		{
		};

		$R.getContent__nextPage__ajaxComplete = function (_pageNr, _response, _textStatus, _xhr)
		{
			//	valid?
			//	======
				if (_response > ''); else { return; }

			//	script
			//	======
				var _script = ''
					+ '<script type="text/javascript">'
					+ ' function __this_page_loaded()'
					+ '	{'
					+ ' 	window.setTimeout('
					+ ' 		function () {'
                    +               ($R.component ? 'window.parent.' : 'window.parent.parent.')
                    +                   '$readable.getContent__nextPage__loadedInFrame("'+_pageNr+'", window); }, '
					+ ' 		250'
					+ ' 	);'
					+ ' } '

					+ ' if (document.readyState); else { __this_page_loaded(); } '

					+ ' function __this_page_loaded_ready(delayedNrTimes)'
					+ ' {'
					+ ' 	if (document.readyState != "complete" && delayedNrTimes < 30)'
					+ '			{ setTimeout(function () { __this_page_loaded_ready(delayedNrTimes+1); }, 100); return; }'

					+ ' 	__this_page_loaded();'
					+ ' }'

					+ ' __this_page_loaded_ready(0);'
					+ '</script>'
				;

			//	get html
			//	========
				var _html = _response;

				//	normalize
				//	=========
					_html = _html.replace(/<\s+/gi, '<');
					_html = _html.replace(/\s+>/gi, '>');
					_html = _html.replace(/\s+\/>/gi, '/>');

				//	remove
				//	======
					_html = _html.replace(/<script[^>]*?>([\s\S]*?)<\/script>/gi, '');
					_html = _html.replace(/<script[^>]*?\/>/gi, '');
					_html = _html.replace(/<noscript[^>]*?>([\s\S]*?)<\/noscript>/gi, '');

				//	add load handler
				//	================
					_html = _html.replace(/<\/body/i, _script+'</body');


			//	append frame
			//	============
				$R.$nextPages.append(''
					+ '<iframe'
					+ ' id="nextPageFrame__'+_pageNr+'"'
					+ ' scrolling="no" frameborder="0"'
					+ '></iframe>'
				);


			//	write to frame
			//	==============
				var _doc = $('#nextPageFrame__'+_pageNr).contents().get(0);
					_doc.open();
					_doc.write(_html);
					_doc.close();
		};


	//	loaded in frame
	//	===============
		$R.getContent__nextPage__loadedInFrame = function (_pageNr, _pageWindow)
		{
			//	find
			//	====
				var
                    _found = $R.getContent__findInPage(_pageWindow),
                    _foundHTML = _found._html,
                    _removeTitleRegex = new RegExp($R.articleTitleMarker__start + '(.*?)' + $R.articleTitleMarker__end, 'i')
                ;

            //  get first fragment
            //  ==================
                var _firstFragment = $R.getContent__nextPage__getFirstFragment(_foundHTML);

                //  gets first 2000 characters
                //  diff set at 100 -- 0.05
                switch (true)
                {
                    case ($R.levenshteinDistance(_firstFragment, $R.nextPage__firstFragment__firstPage) < 100):
                    case ($R.levenshteinDistance(_firstFragment, $R.nextPage__firstFragment__lastPage) < 100):

                        //  mark
                        $R.debugPrint('NextPage', 'false');

                        //  mark again
                        if ($R.debug) { $('#debugOutput__value__NextPage').html('false'); }

                        //  pop page
                        $R.nextPage__loadedPages.pop();

                        //  break
                        return false;

                    default:
                        //  add to first fragemnts
                        $R.nextPage__firstFragment__lastPage = _firstFragment;
                        break;
                }

            //  remove title -- do it twice
            //  ============

                //  once with document title
                _foundHTML = $R.getContent__find__isolateTitleInHTML(_foundHTML, ($R.document.title > '' ? $R.document.title : ''));
                _foundHTML = _foundHTML.replace(_removeTitleRegex, '');

                //  once with article title
                _foundHTML = $R.getContent__find__isolateTitleInHTML(_foundHTML, $R.articleTitle);
                _foundHTML = _foundHTML.replace(_removeTitleRegex, '');


			//	display
			//	=======
				$R.displayPageHTML(_foundHTML, _pageNr, _pageWindow.location.href);

			//	next
			//	====
				$R.getContent__nextPage__find(_pageWindow, _found._links);
		};


		//	display HTML
		//	============

	$R.displayPageHTML = function (_processedPageHTML, _pageNr, _pageURL)
	{
		//	separator
		//	=========
			if (_pageNr > 1)
			{
				$R.$pages.append(''
					+ '<div class="pageSeparator">'
					+	'<div class="pageSeparatorLine setTextColorAsBackgroundColor"></div>'
					+ 	'<div class="pageSeparatorLabel"><em>'+$R.translate('misc__page')+' '+_pageNr+'</em></div>'
					+ '</div>'
				);
			}

        //  the text
        //  $R.log(_processedPageHTML);


        //  add fragment separators
        //  =======================

            //  protect stuff
            //  =============

                var
                    _protect_stuff = [],
                    _protect_stuff__fn = function (_m)
                    {
                        //  exclude these
                        //  if (_m.match(/^<\/(h1|h2|h3|h4|h5|h6|p|div)>$/gi)) { return; }

                        //  add to protected array
                            _protect_stuff.push(_m);
                            return '[[='+(_protect_stuff.length-1)+']]';
                    }
                ;

                //  add absolute start
                    if ($R.getContent__find__hasIsolatedTitleInHTML(_processedPageHTML))
                    {
                        _processedPageHTML = ''
                            + _processedPageHTML.substr(0, $R.articleTitleMarker__start.length)
                            + _processedPageHTML
                                .substr($R.articleTitleMarker__start.length)
                                .replace(/<[^>]+>/gi, _protect_stuff__fn)
                                .replace(/^(\s*)([^0-9\s\[\=])/gi, '$1<separator>$2</separator>')
                        ;
                    }
                    else
                    {
                        _processedPageHTML = _processedPageHTML
                            .replace(/<[^>]+>/gi, _protect_stuff__fn)
                            .replace(/^(\s*)([^0-9\s\[\=])/gi, '$1<separator>$2</separator>');
                    }

                //  abreviations
                    _processedPageHTML = _processedPageHTML.replace(/(Mr|Ms|Mrs|Sr|Jr)[.]/gi, _protect_stuff__fn);

                //  acronyms & initials
                    _processedPageHTML = _processedPageHTML.replace(/[ ]([a-z][.]){1,5}/gi, _protect_stuff__fn);

                //  extensions
                    _processedPageHTML = _processedPageHTML.replace(/[.](com|net|org|[a-z]{3})/gi, _protect_stuff__fn);

                //  ellipsis -- protect two out of the three dots
                    _processedPageHTML = _processedPageHTML.replace(/[.][.]/gi, _protect_stuff__fn);

            //  add separators
            //  ==============

                //  per sentence
                    _processedPageHTML = _processedPageHTML.replace(/([.?!])/gi, '<separator>$1</separator>');
                    _processedPageHTML = _processedPageHTML.replace(/([\u3000\u3001\u3002])/gi, '<separator>$1</separator>');

                //  remove short sentences -- twice
                    for (var _i=0; _i<2; _i++) {
                        _processedPageHTML = _processedPageHTML.replace(
                            /(<separator>.<\/separator>)([\s\S]+?)<separator>(.)<\/separator>/gi,
                            function (_whole, _first_separator, _string_between_separators, _second_separator_character)
                                { return ((_string_between_separators.length > 50) ? _whole : (_first_separator + _string_between_separators + _second_separator_character));
                        });
                    }

                //  add absolute start; end is at the very end
                    //_processedPageHTML = _processedPageHTML.replace(/^([^a-z]*?)([a-z])/gi, '$1<separator>$2</separator>');
                    //_processedPageHTML = _processedPageHTML.replace(/^(\s*)([^\s0-9\[=])/gi, '$1<separator>$2</separator>');


            //  put protected stuff back
            //  ========================
                _processedPageHTML = _processedPageHTML.replace(
                    /\[\[=([0-9]+)\]\]/gi,
                    function (_m, _i) { return _protect_stuff[Math.floor(_i)]; }
                );


            //  add proper separator tag
            //  ========================
                _processedPageHTML = _processedPageHTML.replace(/<separator>([\S])<\/separator>/gi, '<b class="speechFragmentSeparator">$1</b>');
                _processedPageHTML = _processedPageHTML.replace(/<separator>[\s]*<\/separator>/gi, '');


            //  add absolute end
            //  ================
                _processedPageHTML += '<b class="speechFragmentSeparator">&nbsp;</b>';


		//	append page
		//	===========
			$R.$pages.append(''
				+ '<div class="page" id="page'+_pageNr+'">'
                +     '<div class="page_content">'
				+ 	      _processedPageHTML
                +     '</div>'
				+ '</div>'
			);


        //  this new page
        //  =============

            //  cache
                var _$page = $('#page'+_pageNr);

            //  end of headers
                _$page.find('h6, h5, h4, h3, h2, h1').each(function (_i, _e)
                {
                    //  vars
                        var
                            _h_html = $(_e).html(),
                            _h_protected_stuff = [],
                            _text = _h_html.replace(/(<[^>]+>)/gi, '')
                        ;

                    //  ends in punctuation already
                        if (_text.match(/([.?!])\s*$/gi)) { return; }

                    //  protect tags -- use |
                        _h_html = _h_html.replace(/(<[^>]+>)/gi, function (_m)
                        {
                            _h_protected_stuff.push(_m);

                            var _h_protected_stuff_key = '';
                            for (var _i=0, _ii=_h_protected_stuff.length; _i<_ii; _i++) { _h_protected_stuff_key += '|'; }

                            return '[[=' + _h_protected_stuff_key + ']]';
                        });

                    //  add separator
                        _h_html = _h_html.replace(/([a-z0-9])([^a-z0-9]*)$/gi, '$1<b class="speechFragmentSeparator">&nbsp;</b>$2');

                    //  un-protect tags
                        _h_html = _h_html.replace(
                            /\[\[=([|]+)\]\]/gi,
                            function (_m, _s) { return _h_protected_stuff[(_s.split('|').length-2)]; }
                        );

                    //  set new html
                        $(_e).html(_h_html);
                });

            //  add IDs to fragment separators
                _$page.find('div.page_content b.speechFragmentSeparator')
                    .each(function (_i, _e)
                    {
                        $(_e).attr(
                            'id',
                            'speechFragmentSeparator__' + _pageNr + '_' + _i
                        );
                    });

            //  process page duplicate
                if ($R.speech__addDuplicateToFuturePages) { $R.speech__addDuplicateToPage(_$page.get(0), _pageNr); }

            //	links as footnotes
                _$page.find('a').each(function (_index, _element)
                {
                    //	check
                    var _href = _element.href;
                    if (_href > ''); else { return; }
                    if (_href.indexOf); else { return; }
                    if (_href.indexOf('#') > -1) { return; }

                    //	count
                    var _nr = ++$R.footnotedLinksCount;

                    //	add
                    $(_element).append(' <sup class="readableLinkFootnote">['+_nr+']</sup>');
                    $R.$footnotedLinks.append('<li>'+_href+'</li>');
                });


        //  update page count
        //  =================
            $R.pagesCount = $R.$pages.find('> div.page').length;
	};


		//	appear
		//	======

    //  times
    //  =====

        $R.appearTimes__show__background = 500;
        $R.appearTimes__show__sidebar = 500;

        $R.appearTimes__hide__sidebar = 100;
        $R.appearTimes__hide__background = 500;


	//	var
	//	===
		$R.visible = false;

		$R.pagePositionBeforeShow__x = 0;
		$R.pagePositionBeforeShow__y = 0;

	//	content
	//	=======
		$R.hideContent = function () { $R.$box.hide(); $R.$loading.hide(); };
		$R.showContent = function () { $R.$box.show(); $R.$loading.hide(); $R.scrolledWindowWhileReadableVisible(); }


	//	show
	//	====
		$R.show = function (_endFunction)
		{
			//	bind scroll
			//	===========
				$R.$document.bind('scroll', $R.scrolledWindowWhileReadableVisible);

			//	get specs
			//	=========
				var _width = $R.$iframe.width();

			//	prepare
			//	=======
				$R.$document.find('body, html').addClass('readableBeforeVisible');
				$R.hideContent();

				$R.$sidebar.addClass('belowBackground withoutShading');
				$R.$sidebar.css({'right': '-100px'});

				$R.$backgroundShading.show();
				$R.$background.css({'right': _width+'px'});

			//	scroll
			//	======
				$R.pagePositionBeforeShow__x = $R.$win.scrollLeft();
				$R.pagePositionBeforeShow__y = $R.$win.scrollTop();

				window.scrollTo(0, 0);
				$R.win.scrollTo(0, 0);

			//	show frame
			//	==========
				$R.$iframe.css({'top': '0px', 'left': '0px'});

			//	slide background
			//	================
				$R.$background.animate
				(
					{'right': '50px'},
					$R.appearTimes__show__background,
					'readableEasingBackgroundShow',
					function ()
					{
						$R.$loading.show();
						$R.$sidebar.css({'right': '50px'});

						//	slide sidebar
						//	=============
							$R.$sidebar.animate
							(
								{'right': '0px'},
								$R.appearTimes__show__sidebar,
								'readableEasingSidebarShow',
								function ()
								{
									//	end animation
									//	=============
										$R.$sidebar.removeClass('belowBackground withoutShading');
										$R.$document.find('body, html').addClass('readableVisible');
										$('html').addClass('readableVisible');
										$R.$background.css({'right': '0px'});

									//	focus
									//	=====
										if (window.focus) { window.focus(); }

									//	finished
									//	========
										$R.visible = true;

									//	end function
									//	============
										if (_endFunction && _endFunction.call)
											{ _endFunction.call(); }

                                    //  after show
                                    //  ==========
                                        for (var _i=0, _ii=$R.afterShowRunThese.length; _i<_ii; _i++) {
                                            if ($R.afterShowRunThese[_i].call)
                                                { $R.afterShowRunThese[_i].call(); }
                                        }
								}
							);
					}
				);
		};


	//	hide
	//	====
		$R.hide = function (_endFunction)
		{
			//	get specs
			//	=========
				var _width = $R.$iframe.width();

            //  stop speaking
            //  =============
                if ($R.$html.hasClass('speakPlaying')) { $R.speech__doPause(); }

			//	hide dialog
			//	===========
				$R.hideOpenDialog();

			//	unbind scroll
				$R.$document.unbind('scroll', $R.scrolledWindowWhileReadableVisible);

			//	prepare
				$R.$background.css({'right': '50px'});
				$R.$sidebar.addClass('belowBackground withoutShading');
				$R.$backgroundShading.show();

			//	inverse
				$R.hideContent();
				$('html').removeClass('readableVisible');
				$R.$document.find('body, html').removeClass('readableVisible');

			//	slide sidebar
			//	=============
				$R.$sidebar.animate
				(
					{'right': '50px'},
					$R.appearTimes__hide__sidebar,
					'readableEasingSidebarHide',
					function ()
					{
						$R.$sidebar.css({'right': '-100px'});

						//	slide background
						//	================
							$R.$background.animate
							(
								{'right': _width+'px'},
								$R.appearTimes__hide__background,
								'readableEasingBackgroundHide',
								function ()
								{
									//	end animation
									//	=============
										$R.$document.find('body, html').removeClass('readableBeforeVisible');

									//	show frame
									//	==========
										$R.$iframe.css({'top': '-100%', 'left': '-100%'});

									//	scroll
									//	======
										$R.$win.scrollLeft($R.pagePositionBeforeShow__x);
										$R.$win.scrollTop($R.pagePositionBeforeShow__y);

									//	focus
									//	=====
										if ($R.win.focus) { $R.win.focus(); }

									//	finished
									//	========
										$R.visible = false;

									//	end function
									//	============
										if (_endFunction && _endFunction.call)
											{ _endFunction.call(); }
								}
							);
					}
				);

		};


	//	scrolled
	//	========
		$R.scrolledWindowWhileReadableVisible = function ()
		{
			//	in case main window somehow gets scrolled, scroll it back
			$R.win.scrollTo(0, 0);
		};


	//	custom easing -- http://timotheegroleau.com/Flash/experiments/easing_function_generator.htm
	//	=============

		$.easing['readableEasingBackgroundShow'] = function (x, t, b, c, d)
		{
			/* out cubic :: variation */
			var ts=(t/=d)*t;
			var tc=ts*t;
			return b+c*(-2.5*tc*ts + 10*ts*ts + -14*tc + 7*ts + 0.5*t);
		};

		$.easing['readableEasingSidebarShow'] = function (x, t, b, c, d)
		{
			/* out elastic (small) :: variation */
			var ts=(t/=d)*t;
			var tc=ts*t;
			return b+c*(20.05*tc*ts + -65.25*ts*ts + 79.7*tc + -44.6*ts + 11.1*t);
		};

		$.easing['readableEasingBackgroundHide'] = function (x, t, b, c, d)
		{
			/* out cubic :: variation */
			var ts=(t/=d)*t;
			var tc=ts*t;
			return b+c*(-2.5*tc*ts + 10*ts*ts + -14*tc + 7*ts + 0.5*t);
		};

		$.easing['readableEasingSidebarHide'] = function (x, t, b, c, d)
		{
			/* out cubic :: variation */
			var ts=(t/=d)*t;
			var tc=ts*t;
			return b+c*(-2.5*tc*ts + 10*ts*ts + -14*tc + 7*ts + 0.5*t);
		};


        //  mobile fixes
        //  ============

    //  No FIXED positioning
    //  should override CSS and stuff

    //  page_html, page_body
    //  #readable_iframe
    //  #body
    //  #background, #loading, #blank_error
    //  #dialogs_overlay
    //  #sidebar
    //  #fitts


    //  which browsers?
    $R.mobileFixes = false;
    switch (true)
    {
        case ($R.browser == 'iphone'):
        case ($R.browser == 'ipad'):
        case ($R.browser == 'android'):
        case ($R.browser == 'dolphin'):
        case ($R.browser == 'firefox_mobile'):
        case ($R.browser == 'chrome_mobile'):
        case ($R.browser == 'windows_phone'):
            $R.mobileFixes = true;
            break;
    }


    //  work
    (function(){

        //  mobile, or return
        //  =================
            if ($R.mobileFixes); else { return; }


        //  outside
        //  =======
            var
                _document = $R.document,

                _html = _document.getElementsByTagName('html')[0],
                _html_identifier = (_html.id && _html.id > '' && _html.id.match(/^[a-z]/i) != null ? '#'+_html.id : 'html'),

                _body = _document.getElementsByTagName('body')[0],
                _body_identifier = (_body.id && _body.id > '' && _body.id.match(/^[a-z]/i) != null ? '#'+_body.id : 'body'),

                _cssElement = _document.createElement('style'),

                _cssText = ''

                +	_html_identifier + '.readableBeforeVisible, '
                +	'html > ' + _body_identifier + '.readableBeforeVisible, '
                +	_body_identifier + '.readableBeforeVisible '
                +	    '{ position: relative !important; } '

                +	_html_identifier + '.readableVisible, '
                +	'html > ' + _body_identifier + '.readableVisible, '
                +	_body_identifier + '.readableVisible '
                +	    '{ overflow: scroll !important; overflow-x: scroll !important; overflow-y: scroll !important; }'

                +	_html_identifier + '.readableBeforeVisible #readable_iframe, '
                +	'html > ' + _body_identifier + '.readableBeforeVisible #readable_iframe, '
                +	_body_identifier + '.readableBeforeVisible #readable_iframe, '
                +	'#readable_iframe '
                + 	    '{ overflow: hidden !important; height: ' + (($($R.document).height()*5) + 'px') + ' !important; } '
            ;

            //	append css
            //	==========
                _cssElement.setAttribute('id', 'readableCSSMobile');
                _cssElement.setAttribute('type', 'text/css');
                if (_cssElement.styleSheet) {_cssElement.styleSheet.cssText = _cssText; }
                    else { _cssElement.appendChild(_document.createTextNode(_cssText)); }
                _body.appendChild(_cssElement);

            //  frame attributes
            //  ================
                $R.$document.find('#readable_iframe').attr('scrolling', 'no');


        //  inside
        //  ======
                var
                    _cssElement = document.createElement('style'),
                    _cssText = ''

                    +   '#html, #body '
                    +       '{ overflow: hidden !important; overflow-y: hidden !important; height: '+(($($R.document).height()*5) + 'px')+' !important; } '

                    +   '#body '
                    +       '{ position: relative !important; } '

                    +   '#background, #loading, #blank_error '
                    +       '{ position: absolute !important; } '

                    +   '#sidebar '
                    +       '{ position: absolute !important; } '

                    +   '#dialogs_overlay '
                    +       '{ position: absolute !important; } '

                    +   '#fitts '
                    +       '{ position: absolute !important; display: none !important; } '

                    +   '#sidebar_menu__print '
                    +       '{ display: none !important; } '

                    +   '#loading, #loading_spinner '
                    +       '{ background-position: 50% 200px !important; } '

                ;

            //	append css
            //	==========
                _cssElement.setAttribute('type', 'text/css');
                _cssElement.setAttribute('id', 'mobileCSS');
                if (_cssElement.styleSheet) { _cssElement.styleSheet.cssText = _cssText; }
                    else { _cssElement.appendChild(document.createTextNode(_cssText)); }

                $('head').append(_cssElement);


        //  ux fixes
        //  ========

            //  show/hide times
            //  ===============
            $R.appearTimes__show__background = 10;
            $R.appearTimes__show__sidebar = 500;
            $R.appearTimes__hide__sidebar = 100;
            $R.appearTimes__hide__background = 10;

            //  no more scroll-back of main page
            $R.scrolledWindowWhileReadableVisible = function () {};

            //  fitts
            $R.ux__fitts_click = function () {};

            //  background
            $R.ux__background_dblclick = function () {};

            //  redraw dialogs fix, for android / dolphin
            //  doesn't really work for dolphin
            (function()
            {
                //  return
                if ($R.browser == 'android'); else { return; }

                //  show
                var _old__dialog_show = $R.showDialog;
                $R.showDialog = function (_dialog_id)
                {
                    _old__dialog_show(_dialog_id);
                    var _top = $R.$win.scrollTop();
                    window.setTimeout(function () { $R.$win.scrollTop(_top + 1); window.setTimeout(function () { $R.$win.scrollTop(_top); }, 500); }, 500);
                };

                //  hide
                var _old__dialog_hide = $R.hideDialog;
                $R.hideDialog = function (_dialog_id)
                {
                    _old__dialog_hide(_dialog_id);
                    var _top = $R.$win.scrollTop();
                    window.setTimeout(function () { $R.$win.scrollTop(_top + 1); window.setTimeout(function () { $R.$win.scrollTop(_top); }, 500); }, 500);
                };
            })();

    })();

		//	launch
		//	======

	//	clicked
	//	=======
		$R.bookmarkletClicked = function ()
		{
			//	log -- console might not have been activated on first run
			//	===
				if ($R.debug) { $R.initializeWriteLogFunction(); }


			//	blank page -- mini show
			//	==========
				switch (true)
				{
					case (window.parent.location.href.indexOf('chrome:') === 0):
					case (window.parent.location.href.indexOf('about:') === 0):

						$R.$document.find('body, html').addClass('readableBeforeVisible readableVisible');
						$('html').addClass('readableVisible');

						window.scrollTo(0, 0);
						$R.win.scrollTo(0, 0);

						$('#blank_error').show();

						$R.$iframe.css({'top': '0px', 'left': '0px'});

						return;
				}


			//	already visible, but now clipping
			//	=================================
				if ($R.visible && $R.clipOnFirstLaunch && $R.clipOnFirstLaunch == true)
				{
					$R.clipOnFirstLaunch = false;
					$R.bookmarkletTimer = false;

					$R.menu_functions['clip_to_evernote'].call();

					return;
				}


			//	already visible? -- hide
			//	================
				if ($R.visible)
				{
					$R.hide(function() { $R.bookmarkletTimer = false; });
					return;
				}


			//	show -- apply options; load fonts; get content
			//	====

				//	get options -- in case they changed

					$R.getFromExtension__options();


				//	apply options -- in case they changed
				$R.applyOptions();

				//	show -> get content
				$R.show(function ()
				{
                    //  actually show
                    //  =============
                        $R.applyOptions__fonts();
                        $R.getContent();

                    //  some actions
                    //  ============
                        switch (true)
                        {
                            case ($R.clipOnFirstLaunch && ($R.clipOnFirstLaunch == true)):
                                $R.clipOnFirstLaunch = false;
                                $R.menu_functions['clip_to_evernote'].call();
                                break;

                            case ($R.highlightOnFirstLaunch && ($R.highlightOnFirstLaunch == true)):
                                $R.highlightOnFirstLaunch = false;
                                $R.menu_functions['highlight_to_evernote'].call();
                                break;

                            case ($R.speakOnFirstLaunch && ($R.speakOnFirstLaunch == true)):
                                $R.speakOnFirstLaunch = false;
                                $R.menu_functions['speak'].call();
                                break;
                        }

                    //  timer
                    //  =====
                        $R.bookmarkletTimer = false;

                    //  launch events
                    //  =============
                        if ($R.trackedView); else
                        {
                            if ($R.vars)
                            {
                                //  load secure frames

                                    $R.customEvents.dispatchByName('to-extension--evernote--login--request-load--from-outside');


                                //  other extension-y stuff

                                    //  first show?
                                    $R.customEvents.dispatchByName('to-extension--track--first-show--check');

                                    //  track
                                    $R.trackedView = true;
                                    $R.customEvents.dispatchByName('to-extension--track--view');

                                    //	get_recommendation
                                    switch (true)
                                    {
                                        case ($R.vars['related_notes'] == 'enabled'):
                                        case ($R.vars['related_notes'] == 'just_at_bottom'):
                                        case ($R.vars['smart_filing'] == 'enabled'):
                                        case ($R.vars['smart_filing'] == 'just_notebooks'):
                                        case ($R.vars['smart_filing'] == 'just_tags'):
                                            $R.customEvents.dispatchByName('to-extension--evernote--get-recommendation');
                                            break;
                                    }

                            }
                        }
				});
		};


	//	fix flash
	//	=========
		$R.$document.find("param[name='wmode']").attr('value', 'opaque');
		$R.$document.find("embed").attr('wmode', 'opaque');


	//	custom hook
	//	===========
		if ($R.beforeLaunchHook) { $R.beforeLaunchHook(); }


	//	auto-launch
	//	===========
		$R.bookmarkletClicked();


	})(window.parent.$readable);
});