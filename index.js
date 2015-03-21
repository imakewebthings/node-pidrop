var fs = require('fs');
var path = require('path');
var ncp = require('ncp');
var rimraf = require('rimraf');
var disks = require('nodejs-disks');
var _ = require('lodash');
var config = require('nconf').argv().env().file({
  file: path.resolve('.', 'config.json')
});
var swapFolder = path.resolve('.', config.get('swapFolder'));
var lastDriveList;

disks.drives(function(err, drives) {
  lastDriveList = drives;
  setInterval(checkForNewDrives, 1000);
});

function checkForNewDrives() {
  disks.drives(function(err, drives) {
    var diff = _.difference(drives, lastDriveList);

    lastDriveList = drives;
    console.log('Checking for new drives');
    if (!diff.length) {
      return;
    }
    console.log('New drive found');
    diff.forEach(checkForAdminFolder);
  });
}

function checkForAdminFolder(drive) {
  disks.driveDetail(drive, function(err, disk) {
    if (err) {
      return console.log(err);
    }
    var adminPath = path.resolve(disk.mountpoint, config.get('adminFolder'));
    fs.readdir(adminPath, function(err) {
      var userPath = path.resolve(disk.mountpoint, config.get('userFolder'));
      if (err) {
        console.log('No admin folder found');
        return copyUserFolder(userPath);
      }
      copyAdminFolder(adminPath);
    });
  });
}

function copyAdminFolder(folderPath) {
  rimraf(swapFolder, function(err) {
    if (err) {
      return console.log(err);
    }
    ncp(folderPath, swapFolder, function(err) {
      if (err) {
        return console.log(err);
      }
      console.log('Admin folder found, files uploaded');
    });
  });
}

function copyUserFolder(folderPath) {
  ncp(swapFolder, folderPath, function(err) {
    if (err) {
      return console.log(err);
    }
    console.log('Files downloaded to user folder');
  });
}
