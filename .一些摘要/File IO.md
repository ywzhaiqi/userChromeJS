File I/O 摘要
============

Firefox Only.

- [JavaScript OS.File | MDN](https://developer.mozilla.org/en-US/docs/JavaScript_OS.File)：高效、off-main thread、新的 API，用于取代老的 API，可能低版本 firefox 不支持。
- [File I/O - Mozilla | MDN](https://developer.mozilla.org/en-US/Add-ons/Code_snippets/File_I_O)：老的 API。

OS.File
--------

- [OS.File for the main thread - JavaScript OS.File | MDN](https://developer.mozilla.org/en-US/docs/JavaScript_OS.File/OS.File_for_the_main_thread)
- [Path manipulation - JavaScript OS.File | MDN](https://developer.mozilla.org/en-US/docs/JavaScript_OS.File/OS.Path)

### 导入

	Components.utils.import("resource://gre/modules/osfile.jsm")

### 示例：读取当前配置 chrome 下的 userChrome.css

```js
let decoder = new TextDecoder();        // This decoder can be reused for several reads
let path = OS.Path.join(OS.Constants.Path.profileDir, "chrome", "userChrome.css");
let promise = OS.File.read(path); // Read the complete file as an array
promise = promise.then(
  function onSuccess(array) {
    let text = decoder.decode(array);        // Convert this array to a text
    return alert(text);
  }
);
```

### 示例：写入内容到当前配置 chrome 下的 file.txt

```js
let encoder = new TextEncoder();                                   // This encoder can be reused for several writes
let array = encoder.encode("This is some text. 中文");             // Convert the text to an array
let path = OS.Path.join(OS.Constants.Path.profileDir, "file.txt");
let promise = OS.File.writeAtomic(path, array,                     // Write the array atomically to "file.txt", using as temporary
    {tmpPath: "file.txt.tmp", noOverwrite: true});                 // buffer "file.txt.tmp".
```

### 一些代码片段

```js
OS.Path.basename(PATH)

OS.Path.dirname(PATH)

OS.Path.join(tmpDir, "foo", "bar")

OS.Path.normalize(PATH)

OS.Path.split(PATH)
```

File I/O
--------

[File I/O - Mozilla | MDN](https://developer.mozilla.org/en-US/Add-ons/Code_snippets/File_I_O)

### Getting files in special directories

```js
Components.utils.import("resource://gre/modules/FileUtils.jsm");

// get the "data.txt" file in the profile directory
var file = FileUtils.getFile("ProfD", ["data.txt"]);
```

Or the same without using [File Utils.jsm](https://developer.mozilla.org/en-US/docs/JavaScript_code_modules/FileUtils.jsm):

```js
// get profile directory
var file = Components.classes["@mozilla.org/file/directory_service;1"].
           getService(Components.interfaces.nsIProperties).
           get("ProfD", Components.interfaces.nsIFile);
file.append("data.txt");

// Note: "file" is an object that implements nsIFile. If you want the
// file system path, use file.path
```