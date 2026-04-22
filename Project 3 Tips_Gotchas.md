  
I have been getting a couple of common questions when students are deploying to render.  I will track common solutions here:

* Follow the [deployment guide](https://docs.google.com/document/d/1xUXEnhcJFoUQbBGr5qEAmOyXq1noHXLJzSvC6Hxs_UI/edit?usp=sharing) here when using Render  
  * Particularly, make sure to set your NODE\_VERSION in your environment variable  
* Your directory should be similar to [this repo](https://github.com/ajorgense1-chwy/cs5610_spr23_mod3)  
  * Make sure that your react code is in the frontend section and the Node code is backend section.  You should have 3 package.json files  
  * Make sure to NOT include node\_modules when you deploy code (this should automatically be handled by your .gitignore file, but you may need to delete it manually)  
  * Make sure that the “scripts” sections for the package.json files are similar  
* Make sure that your server.js has [these lines](https://github.com/ajorgense1-chwy/cs5610_spr23_mod3).  
  * If you’re using create-react-app instead of vite (you can based on your package.json in your frontend directory), the word “dist” should be replaced with “build”.  
* To mimic deploying running on Render, if you go to the root directory of your app, you should be able to run: “npm install && npm run build && npm run dev”.  Then you should be able to open your browser to the localhost:8000 (or whatever port you have in your sever.js).  This will behave exactly how Render will run your code