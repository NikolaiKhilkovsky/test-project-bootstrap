#Challenge: create a simple files browser

##Given files API:
```
GET /api/files[?path=]
[{stat}]
 
POST /api/files/rename {from: ... , to: ... }
{stat}
```

```javascript
var stat = {
  name: '/path/to/image-0.jpg' 
  date: 1439473396695, 
  size: 12345,
  [directory: true]
}
```

Assuming there are only 3 types of files:
- jpeg image (.jpg)
- plain text (.txt)
- directory (empty extension)​

##Create a service, operating with files:
- list() - gets list of all entries in directory using HTTP API
- sort() - sort asc and desc by: 
    1) type then name
    2) sum of square roots of date digits ( 123 -> sqrt(1) + sqrt(2) + sqrt(3) )
- rename() - rename file using HTTP API

##Create a service - promised wrapper for standart dialogs: alert, prompt, confirm.
Each api method should return promise, usage example:
```javascript
dialogs.prompt('message').then( ... )
```
This makes it possible to replace native dialogs in the future
and create dialogs with more complex logic.

##Create a page showing list of files in a table-like view:
```
Name             | Size  | Date added                          | Action
[a]image.jpg[/a] | 1.5MB | Today (or Yesterday, or YYYY-MM-DD) | [a]Rename[/a]
```
- Directories should always go first
- Ability to sort list (see description of files service above)
- Click on directory - proceed to browse that directory
- Click on file opens file details page
- URI should reflect current state: browse directory, sort order

##Rename action:
Rename API will respond with an error if you try to use existent file name. In this case ask for a new name and repeat operation.

##Create a file preview page:
- Left: 'preview' for image (use http://placekitten.com), random text for text
- Right: show file information information: name, type, parent directory, date, size (same formatting as in list), and a rename button.

##Create a simple directive for image/text preview:
```html
<preview file='stat' style='width: 200px; height: 200px'></preview>
```

###Allowed libs:
- core AngularJS modules
- lodash/underscore
- bootstrap css
- anything else you can not live without

*Target web browser is the last stable version of Google Chrome*
