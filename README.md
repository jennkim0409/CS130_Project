# initial setup
frontend
--------
1. cd into frontend folder
2. run "npm i" (installs dependencies)

backend
--------
1. install express
2. install nodemon
3. install mongoose

# run the project option #1
1. open up a terminal in the outermost directory of this project (outside frontend/backend directories)
2. run "./run_proj.sh"

# run the project option #2
the above option is probably preferred by frontend, since it hides the backend logs.
but if you want to see both the frontend & backend logs, do this:
1. open up a terminal, cd into frontend, run "npm start"
2. open up another terminal, cd into backend, run "export SECRET=hello" and then run "npm run dev"

hope this makes things a little smoother! =)
