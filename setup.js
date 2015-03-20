var config = require('nconf').file('config.json');
var inquirer = require('inquirer');
var disks = require('nodejs-disks');
var crypto = require('crypto');
var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var lastDriveList, timer, answers;

if (Object.keys(config.get()).length) {
  return console.log('Config already exists')
}

console.log("This setup process will create a configuration file for the Pidrop.\n");

inquirer.prompt([{
  name: 'userFolder',
  message: "When somebody plugs in a USB thumb drive, files will be downloaded to a special folder on that drive. What would you like to name that folder?",
  default: 'pidrop-downloads'
}, {
  name: 'swapFolder',
  message: "The files that are uploaded from your USB thumb drive and downloaded to a user's drive are stored in a folder on the Pi. What would you like to name that filder?",
  default: 'swap'
}], processAnswers);

function processAnswers(promptAnswers) {
  answers = promptAnswers;

  console.log("\nA special folder will be created on your own USB stick to mark you as the admin. This folder is how you will upload files to the Pidrop. Whenever you plug in you admin USB stick, the contents of this special folder will be copied to the local swap folder.\n");
  console.log("If your admin USB stick is currently plugged in, please unplug it before continuing.");

  inquirer.prompt([{
    type: 'confirm',
    name: 'yes',
    message: 'Is your USB stick unplugged?'
  }], pollForNewDrives);
}

function pollForNewDrives() {
  disks.drives(function(err, drives) {
    lastDriveList = drives;
    console.log("\nPlease insert your admin USB stick now.");
    timer = setInterval(checkForNewDrives, 1000);
  });
}

function checkForNewDrives() {
  disks.drives(function(err, drives) {
    var diff = _.difference(drives, lastDriveList);

    lastDriveList = drives;
    if (!diff.length) {
      return;
    }
    console.log('New drive found, creating admin folder.');
    clearInterval(timer);
    createAdminFolder(diff[0]);
  });
}

function createAdminFolder(drive) {
  disks.driveDetail(drive, function(err, disk) {
    var randomness = crypto.randomBytes(16).toString('hex');
    var adminFolderName = 'pidrop-' + randomness;
    if (err) {
      return console.log(err);
    }

    fs.mkdir(path.resolve(disk.mountpoint, adminFolderName), function(err) {
      if (err) {
        return console.log(err);
      }
      config.set('adminFolder', adminFolderName);
      config.set('swapFolder', answers.swapFolder);
      config.set('userFolder', answers.userFolder);
      config.save(function(err) {
        if (err) {
          console.log(err);
        }
        console.log("\nAn empty folder named " + adminFolderName + " has been created on this USB stick. Do not rename this folder. You may now unplug the USB stick. Setup is complete.\n");
      });
    });
  });
}
