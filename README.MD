__Trying to use fable-core.js on Google gives errors due to some naming collisions..
Here there are some minor changes to solve the problem.
All naming collision has been prefixed with "GAS_"__

### MODIFY AND COMPILE fable-core.ts IN ORDER TO USE IT ON GOOGLE SCRIPT
1. Install Babel
npm i babel-cli --global
2.  Install Babel UMD Transform:
npm install --save-dev babel-plugin-transform-es2015-modules-umd
3. Modify fable-core.ts in order to get rid of duplicate name. All modified name have been prefixed with "GAS_".
Moreover the function "fableGlobal" has been modify to return "this" instead of null at the very end.
4. compile fable-core-ts with the following setup
```
///tsconfig.json
{
    "compilerOptions": {
        "target": "es5",
        "module": "commonjs",
        "noImplicitAny": true,
        "noImplicitReturns": true
    },
    "files": [
        "fable-core.ts"
    ]
}
```
### GET THE NECESSARY POLYFILL (Google Script are not es6 compatible)
1. Install Babel polyfill:
npm install --save-dev babel-polyfill
2. Grab the file polyfill.js on the "babel-polyfill\babel-polyfill\disp" folder

### CREATE THE GOOGLE APP FUNCTION
1. Post-process the resulting polyfill.js and fable-core.js with Babel:
babel polyfill.js fable-core.js --plugins babel-plugin-transform-es2015-modules-umd -o fable-core-umd.js
2. Simply copy past content of "fable-core-umd.js"

### NOTE: some opinionable changed ......
1. in fable-core.ts I changed "catch" => "GAS_catch" due to Google Script compleining with name resolution:
  static awaitPromise<T>(p: Promise<T>) {
    return Async.fromContinuations((conts: Array<Continuation<T>>) =>
      p.then(conts[0]).GAS_catch(err =>
        (err == "cancelled" ? conts[2] : conts[1])(err))); 