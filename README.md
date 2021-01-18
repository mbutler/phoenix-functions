# Phoenix Functions
A small library for working with Phoenix Command RPG lookup tables.

babel + webpack + mocha + chai + documentationjs

`npm start` - compile source and run dev server

`npm test` - run unit tests

`npm run-script document` - generate docs for all comments in valid JSDoc format

# To Add New Weapons:
1. transcribe entry in Phoenix Command book into input form: https://phoenixcommand.net/gun-form/
2. upload png image of weapon to firebase storage
3. add weapon image link to weapon json
4. add resulting json to weapons.js file
5. build phoenix functions npm project
6. increment version number in package.json
7. npm publish
8. increment phoenix-functions dependency in firebird-character package.json file
9. build firebird-character (use nvm to use older node version if getting gyp errors. v10 worked)
10. firebase deploy
11. push to github

