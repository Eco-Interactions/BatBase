#! /bin/bash
# rp: kik

newUser='bei_dev'
newDbPassword='dbPw'
newDb='bei_test'
host=localhost
#host='%'
 
commands="DROP DATABASE IF EXISTS \`${newDb}\`;CREATE DATABASE \`${newDb}\`;
CREATE USER IF NOT EXISTS '${newUser}'@'${host}' IDENTIFIED BY '${newDbPassword}';
GRANT USAGE ON *.* TO '${newUser}'@'${host}' IDENTIFIED BY '${newDbPassword}';
GRANT ALL privileges ON \`${newDb}\`.*TO '${newUser}'@'${host}';FLUSH PRIVILEGES;"

echo "${commands}" | /usr/bin/mysql -u root -p