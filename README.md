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

We need to install Griddb c_client in order to run Griddb with Node Js, head over to [Griddb_c_client releases](https://github.com/griddb/c_client/releases) page and download the package that fits best to your Operating System. Since we are setting up our environment on Ubuntu 20.04 LTS so we will grab .deb file.

#### Install griddb_c_client

```bash
# The latest version is 5.3.0 at the time of writing this
$ sudo dpkg -i gridd-c_client_5_3_0_amd64.deb

```

Once the Griddb Node js client is installed, then we will install node version 10.16 because the griddb node js requires this version.

```bash
$ nvm install 10.16

$ nvm use 10.16

# Confirm we are using node version 10.x
$ node -v
 v10.16.0
```

## Running the chat application

Everything is almost ready, The last step is to point our LD_LIBRARY to our c_client installation.

```bash

# First check the path and make sure griddb client is installed in /user

# Then use
$ export LD_LIBRARY_PATH=${LD_LIBRARY_PATH}:/usr/griddb_c_client-4.2-0/lib/

```

And we can now officially run JavaScript with our GridDB cluster.

```bash
# Go to the application

$ cd /path/to/application

# Install the packages
$ npm install

# Run the application

$ npm run start
```
