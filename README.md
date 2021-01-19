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
5. write weapon's test and run tests
6. build phoenix functions npm project
7. increment version number in package.json
8. npm publish
9. increment phoenix-functions dependency in firebird-character package.json file
10. build firebird-character (use nvm to use older node version if getting gyp errors. v10 worked)
11. firebase deploy
12. push to github
