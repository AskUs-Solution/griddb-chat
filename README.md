# Griddb with Nodejs

## Installation Ubuntu

```bash
# Add the apt repo
sudo sh -c 'echo "deb https://www.griddb.net/apt griddb/5.3 multiverse" >>  /etc/apt/sources.list.d/griddb.list'

# Import the Key
wget -qO - https://www.griddb.net/apt/griddb.asc | sudo apt-key add -

# Then install Griddb
$ sudo apt update
$ sudo apt install griddb-meta

# And now, you can start griddb
$ sudo systemctl start gridstore

```

Once Griddb is up and running, you can drop into shell like so:

```bash

$ sudo -su gsadm


# Setup griddb home and log directories

$ export GS_HOME=/var/lib/gridstore/
$ export GS_LOG=/var/lib/gridstore/log/


# Then start your node
# username/password - admin is default user and password
$ gs_startnode -u admin/admin

# Join Cluster

$ gs_joincluster -u admin/admin

# You can see your node & cluster stats using:

$ gs_stat -u admin/admin
```

### Node JS environment

Our Griddb is all set up and running, now it's time to set up our Node JS environment to run the chat application.

```bash
# Go to the application

$ cd griddb-chat

# Install the packages
$ npm install

# Run the application

$ npm run start
```
