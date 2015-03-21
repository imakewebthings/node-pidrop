#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var ncp = require('ncp');
var rimraf = require('rimraf');
var disks = require('nodejs-disks');
var _ = require('lodash');
var config = require('nconf').argv().env().file({
  file: path.join(__dirname, 'config.json')
});
var swapFolder = path.join(__dirname, config.get('swapFolder'));
var lastDriveList;

disks.drives(function(err, drives) {
  lastDriveList = drives;
  console.log('Checking for new drives');
  setInterval(checkForNewDrives, 1000);
});

function checkForNewDrives() {
  disks.drives(function(err, drives) {
    var diff = _.difference(drives, lastDriveList);

    lastDriveList = drives;
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
      if (err) {
        console.log('No admin folder found');
        return copyUserFolder(disk.mountmount);
      }
      copyAdminFolder(disk.mountpoint);
    });
  });
}

function copyAdminFolder(mountpoint) {
  var adminPath = path.resolve(mountpoint, config.get('adminFolder'));
  rimraf(swapFolder, function(err) {
    if (err) {
      return console.log(err);
    }
    ncp(adminPath, swapFolder, function(err) {
      if (err) {
        return console.log(err);
      }
      console.log('Admin folder found, files uploaded');
      unmount(mountpoint);
    });
  });
}

function copyUserFolder(mountpoint) {
  var userPath = path.resolve(mountpoint, config.get('userFolder'));
  ncp(swapFolder, userPath, function(err) {
    if (err) {
      return console.log(err);
    }
    console.log('Files downloaded to user folder');
    unmount(mountpoint);
  });
}

function unmount(mountpoint) {
  exec('pumount ' + mountpoint, function(err, stdout, stderr) {
    if (!err) {
      console.log(mountpoint + ' unmounted');
    }
  });
}
