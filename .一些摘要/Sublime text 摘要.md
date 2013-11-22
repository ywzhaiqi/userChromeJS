Sublime text 摘要
================

@[my|editor|text]

设置
----

	"color_scheme": "Packages/Solarized Color Scheme/Solarized (dark).tmTheme",
	"font_face": "Monaco",
	"font_size": 11,
	"word_separators": "./\\()\"'-:,.;<>~!@#$%^&*|+=[]{}`~?，。、“”：（）"

扩展
----

官方扩展中心：[Package Control - the Sublime Text package manager](https://sublime.wbond.net/)

### 常用

- **[ConvertToUTF8](https://github.com/seanliang/ConvertToUTF8)**
- **Solarized Color Scheme**, markdown 格式支持的好点。
- [AlignTab](https://github.com/randy3k/AlignTab)
- [SideBarEnhancements](https://github.com/titoBouzout/SideBarEnhancements)
- [SublimeREPL](https://github.com/wuub/SublimeREPL)
- Git
- JsFormat, `ctrl+alt+f`, 格式化html中的js时需要先选择要格式化的js
- Markdown Preview
- Emment
- [Better JavaScript](https://github.com/int3h/sublime-better-javascript)，增强函数的识别。不必安装，可直接复制部分内容到原来的 `JavaScript` 文件夹中，

### 可选

- [AdvancedNewFile](https://github.com/skuroda/Sublime-AdvancedNewFile), `ctrl+alt+n`,
- [File History](https://github.com/FichteFoll/sublimetext-filehistory)。打开最近关闭的文件，`Ctrl+Shift+T`
- [EasyMotion](https://github.com/tednaleid/sublime-EasyMotion)。文字跳转，`Ctrl+;` 跳转，`Ctrl+shift+;` 选择跳转
- [Filter Lines](https://github.com/davidpeckham/FilterLines)。
- CTags
- Theme - Soda
- [Edit History](https://github.com/Stuk/sublime-edit-history)，Sublime text 3 已经内置。
- Bracket Highlighter, 括号匹配高亮
- KeymapManager, 快捷键管理
- AndyPython, Python标准库帮助提示
- SublimeLinter
  - `Show Error List` 查看代码问题
- SublimeCodeIntel

        For Windows:
          * Jump to definition = ``Alt+Click``
          * Jump to definition = ``Control+Windows+Alt+Up``
          * Go back = ``Control+Windows+Alt+Left``
          * Manual CodeIntel = ``Control+Shift+space``

- [Python PEP8 Autoformat](https://bitbucket.org/StephaneBunel/pythonpep8autoformat). 自动格式化代码以符合大部分pep8规范，windows 下，使用ctrl+shift+r 即可调用
- Python Coverage: 代码覆盖率统计工具
- Python Anywhere Editor: Edit your files from [www.PythonAnywhere.com](www.PythonAnywhere.com)
- [Python Flake8 Lint](https://github.com/dreadatour/Flake8Lint)

  - Flake8Lint is a Sublime Text 2 plugin for check Python files against some of the style conventions in [PEP8](http://www.python.org/dev/peps/pep-0008/), [PyFlakes](https://launchpad.net/pyflakes) and [mccabe](http://nedbatchelder.com/blog/200803/python_code_complexity_microtool.html)
  - PEP 8 -- [Style Guide for Python Code](http://www.python.org/dev/peps/pep-0008/)

- Python Imports Sorter

### 语法高亮

- Better CoffeeScript
- BBCode Syntax
- AutoHotkey
- AutoItScript
- VBScript

Sublime text 2 相关
-------------------

### 开启 Package Control

Ctrl+~ （数字1左边的按键）调出控制台

```python
import urllib2,os; pf='Package Control.sublime-package'; ipp=sublime.installed_packages_path(); os.makedirs(ipp) if not os.path.exists(ipp) else None; urllib2.install_opener(urllib2.build_opener(urllib2.ProxyHandler())); open(os.path.join(ipp,pf),'wb').write(urllib2.urlopen('http://sublime.wbond.net/'+pf.replace(' ','%20')).read()); print 'Please restart Sublime Text to finish installation'
```
