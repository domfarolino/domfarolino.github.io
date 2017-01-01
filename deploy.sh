git branch -D master;
cd ./lib/client && ../../node_modules/webpack/bin/webpack.js && cd ../..
git checkout -b master &&
rm -rf ./public/js/.gitignore
cp -r ./public/* ./ && rm -R ./public/* &&
node render.js;
echo "bosley.club" > CNAME;
git add .
git commit -m "New build"
git push --set-upstream origin master -f &&
git checkout develop
