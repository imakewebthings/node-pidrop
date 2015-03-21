# Node Pidrop

Turn your boring Raspberry Pi into a spy-thriller file dead drop with Node.js and USB sticks.

## How It Works

You will follow the instructions below for setting up the Pi and installing the `pidrop` Node package. You will be prompted with some options and asked to plug in your "Admin" USB stick. This will create a special folder on the USB drive. When the `pidrop` process is running, if you plug in that USB stick with that special folder, the contents of that folder will be copied to the Pi. Whenever **anybody else** plugs in a USB stick the files will be downloaded to their stick.

## Setup Instructions

This project and these instructions assume you are using a Raspberry Pi running Raspian as the `pi` user. They may also work on Mac OSX, but no promises.

1. [Install Node](#install-node)
1. [Automount USB Drives](#automount-usb-drives)
1. [Install Pidrop](#install-pidrop)
1. [Run Pidrop](#run-pidrop)

### Install Node

1. Install [nvm](https://github.com/creationix/nvm) by running `curl https://raw.githubusercontent.com/creationix/nvm/v0.24.0/install.sh | bash`.
1. Open `~/.bashrc` and add this to a new line at the bottom: `source ~/.nvm/nvm.sh`.
1. Run `source ~/.bashrc`.
1. Run `nvm install 0.10.28`.
1. Run `nvm alias default 0.10.28`.
1. Run `nvm use default`.
1. Verify everything works by running `which node`. You should see something like `/home/pi/.nvm/v0.10.28/bin/node`.

### Automount USB Drives

1. Make sure your system is up to date by running `sudo apt-get update` then `sudo apt-get upgrade`.
1. Install [usbmount](http://usbmount.alioth.debian.org/) by running `sudo apt-get install usbmount`.
1. By default, `usbmount` mounts new drives as `root`. We need to mount them as `pi`.
    1. Run `id`. This will print a handful of things to the console. Look for `gid` and `uid` and write down their numbers. Chances are, both of them are `1000`.
    1. Open the `usbmount` config by running `sudo nano /etc/usbmount/usbmount.conf`.
    1. Find the line that reads `FS_MOUNTOPTIONS=""`. It should be blank between the quotes right now.
    1. Inside those quotes, add `-fstype=vfat,gid=1000,uid=1000` where `1000` is replaced with the `gid` and `uid` you wrote down earlier.
    1. Save the file and exit.
1. Reboot the pi by running `sudo reboot`.
1. Verify automounting as `pi` works by:
    1. Plugging in a USB stick.
    1. Run `df`. The last column lists mounting points of drives. You should see one that says something like `/media/usb0`. Note that folder path.
    1. Run `ls -all /media/usb0` using the folder path of your drive, if it is different.
    1. The first line, 3rd and 4th column, should both say `pi`.

### Install Pidrop

1. Run `npm install -g pidrop`.
1. You will see a bunch of dependencies download, then a series of prompts about folder names. The prompts will explain how each folder is used. You can accept the defaults by pressing enter at each prompt.
1. You will then be asked to ensure that your "Admin" USB stick is unplugged. Make sure it is **unplugged**, then answer `y` to continue.
1. You will be asked to now plug in your "Admin" stick. Do this and leave it in until the install instructions tell you it is safe to unplug the stick.

### Run Pidrop

1. Run `pidrop`. The process will now run and wait for drives to be plugged in. You now have an operational Pidrop.

## Current Limitations

- USB drives must be FAT formatted.
