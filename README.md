# Node Pidrop

Turn your boring Raspberry Pi into a spy-thriller file dead drop with Node.js and USB sticks.

## How It Works

You will follow the instructions below for setting up the Pi and installing the `pidrop` Node package. You will be prompted with some options and asked to plug in your "Admin" USB stick. This will create a special folder on the USB drive. When the `pidrop` process is running, if you plug in that USB stick with that special folder, the contents of that folder will be copied to the Pi. Whenever **anybody else** plugs in a USB stick the files will be downloaded to their stick.

## Setup Instructions

This project and these instructions assume you are using a Raspberry Pi running Raspian as the `pi` user. They may also work on Mac OSX, but no promises.

- [Install Node](#install-node)
- [Automount USB Drives](#automount-usb-drives)
- [Install Pidrop](#install-pidrop)
- [Run Pidrop](#run-pidrop)

### Install Node

- Install [nvm](https://github.com/creationix/nvm) by running `curl https://raw.githubusercontent.com/creationix/nvm/v0.24.0/install.sh | bash`.
- Open `~/.bashrc` and add this to a new line at the bottom: `source ~/.nvm/nvm.sh`.
- Run `source ~/.bashrc`.
- Run `nvm install 0.10.28`.
- Run `nvm alias default 0.10.28`.
- Run `nvm use default`.
- Verify everything works by running `which node`. You should see something like `/home/pi/.nvm/v0.10.28/bin/node`.

### Automount USB Drives

- Make sure your system is up to date by running `sudo apt-get update` then `sudo apt-get upgrade`.
- Install [usbmount](http://usbmount.alioth.debian.org/) by running `sudo apt-get install usbmount`.
- By default, `usbmount` mounts new drives as `root`. We need to mount them as `pi`.
    - Run `id`. This will print a handful of things to the console. Look for `gid` and `uid` and write down their numbers. Chances are, both of them are `1000`.
    - Open the `usbmount` config by running `sudo nano /etc/usbmount/usbmount.conf`.
    - Find the line that reads `FS_MOUNTOPTIONS=""`. It should be blank between the quotes right now.
    - Inside those quotes, add `-fstype=vfat,gid=1000,uid=1000` where `1000` is replaced with the `gid` and `uid` you wrote down earlier.
    - Save the file and exit.
- Reboot the pi by running `sudo reboot`.
- Verify automounting as `pi` works by:
    - Plugging in a USB stick.
    - Run `df`. The last column lists mounting points of drives. You should see one that says something like `/media/usb0`. Note that folder path.
    - Run `ls -all /media/usb0` using the folder path of your drive, if it is different.
    - The first line, 3rd and 4th column, should both say `pi`.

### Install Pidrop

- Run `npm install -g pidrop`.
- You will see a bunch of dependencies download, then a series of prompts about folder names. The prompts will explain how each folder is used. You can accept the defaults by pressing enter at each prompt.
- You will then be asked to ensure that your "Admin" USB stick is unplugged. Make sure it is **unplugged**, then answer `y` to continue.
- You will be asked to now plug in your "Admin" stick. Do this and leave it in until the install instructions tell you it is safe to unplug the stick.

### Run Pidrop

- Run `pidrop`. The process will now run and wait for drives to be plugged in. You now have an operational Pidrop.

## Current Limitations

- USB drives must be FAT formatted.
