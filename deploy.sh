git branch -D master;
cd ./lib/client && ../../node_modules/webpack/bin/webpack.js && cd ../..
git checkout -b master &&
rm -rf ./public/js/.gitignore
cp -r ./public/* ./ && rm -R ./public/* &&
node render.js;
echo "domfarolino.com" > CNAME;
git add .
git commit -m "New build: $(date +%Y-%m-%d)"
git push --set-upstream origin master -f &&
git checkout develop
