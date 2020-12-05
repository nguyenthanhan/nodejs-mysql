-- DROP DATABASE IF EXISTS depotManagementDB;

-- CREATE DATABASE `depotManagementDB`;
-- USE `depotManagementDB`;

DROP TABLE IF EXISTS Manager;
CREATE TABLE `Manager` (
  `MngID`                     bigint(20) NOT NULL auto_increment,
  `FName`                     varchar(80) NOT NULL default '',
  `LName`                     varchar(80) NOT NULL default '',
  `accountName`               varchar(80) NOT NULL default '',
  `password`                  varchar(80) NOT NULL ,
  `Address`                   varchar(80) NOT NULL default '',
  `BDay`                      DATETIME NOT NULL ,
  `gender`                    enum('male', 'female', 'other') default 'male',
  `email`                     varchar(80) default '',
  `salary`                    bigint(20),
  `avt_url`                   text,
  `date_start_working`        DATETIME NOT NULL,
  `createdDay`                DATETIME NOT NULL ,
  `managerType`               enum('normal', 'prime') default 'normal',
  `creatorID`                 bigint(20),
  `deleterID`                 bigint(20),
  `deletedDay`                DATETIME ,
  PRIMARY KEY  (`MngID`),
  FOREIGN KEY (`creatorID`) REFERENCES `PrimeMNG` (`mngID`),
  FOREIGN KEY (`deleterID`) REFERENCES `PrimeMNG` (`mngID`),
  UNIQUE  KEY `accountName` (`accountName`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;



DROP TABLE IF EXISTS Product;
CREATE TABLE `Product` (
  `PID`               bigint(20) NOT NULL auto_increment,
  `name`              varchar(80) NOT NULL default '',
  `description`       varchar(80) NOT NULL default '',
  `otherDetail`       varchar(80) NOT NULL default '',
  `barcode`           varchar(40),
  `img_url`           text NOT NULL,
  `W_curr_qtt`        int(20) NOT NULL default '0',
  `W_max_qtt`         int(20) NOT NULL default '0',
  `W_min_qtt`         int(20) NOT NULL default '0',
  `S_curr_qtt`        int(20) NOT NULL default '0',
  `S_max_qtt`         int(20) NOT NULL default '0',
  `S_min_qtt`         int(20) NOT NULL default '0',
  `sell_price`        bigint(20) NOT NULL default '0',
  `import_price`      bigint(20) NOT NULL default '0',
  `brand`             varchar(80) NOT NULL default '',
  `catID`             bigint(20) NOT NULL default '0',
  `shID`              bigint(20) NOT NULL default '0',
  PRIMARY KEY  (`PID`),
  FOREIGN KEY (`catID`) REFERENCES `Category` (`CID`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;



DROP TABLE IF EXISTS Category;
CREATE TABLE `Category` (
  `CID`           bigint(20) NOT NULL auto_increment,
  `name`          varchar(80) NOT NULL default '',
  `shelfID`       bigint(20) NOT NULL default '0',
  PRIMARY KEY  (`CID`),
  FOREIGN KEY (`shelfID`) REFERENCES `Shelf` (`ShID`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;


DROP TABLE IF EXISTS Shelf;
CREATE TABLE `Shelf` (
  `ShID`          bigint(20) NOT NULL auto_increment,
  `name`          varchar(80) NOT NULL default '',
  `type`          enum('ware_house', 'store') default 'store',
  `capacity`      bigint(20) NOT NULL default '0',
  `state`         enum('full', 'available') NOT NULL default 'available',
  PRIMARY KEY  (`ShID`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;


DROP TABLE IF EXISTS Bill;
CREATE TABLE `Bill` (
  `BID`           bigint(20) NOT NULL auto_increment,
  `cus_name`      varchar(80),
  `total`         bigint(20),
  `M_ID`          bigint(20),
  PRIMARY KEY  (`BID`),
  FOREIGN KEY (`M_ID`) REFERENCES `Manager` (`MngID`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;



DROP TABLE IF EXISTS Supplier;
CREATE TABLE `Supplier` (
  `SupID`         bigint(20) NOT NULL auto_increment,
  `name`          varchar(80) NOT NULL default '',
  `Address`       varchar(80) NOT NULL default '',
  `Tax_ID`        int(20) NOT NULL default '0',
  `Email`         varchar(40) NOT NULL default '',
  PRIMARY KEY  (`SupID`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;


DROP TABLE IF EXISTS Import;
CREATE TABLE `Import` (
  `ImID`          bigint(20) NOT NULL auto_increment,
  `mngID`         bigint(20) NOT NULL default '0',
  `total`         bigint(20),
  `date`          DATETIME NOT NULL default CURRENT_TIMESTAMP,
  `state`         enum('ready', 'executed', 'close') NOT NULL ,
  PRIMARY KEY (`ImID`),
  FOREIGN KEY (`mngID`) REFERENCES `Manager` (`MngID`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;



DROP TABLE IF EXISTS Export;
CREATE TABLE `Export` (
  `ExID`          bigint(20) NOT NULL auto_increment,
  `mngID`         bigint(20) NOT NULL default '0',
  `date`          DATETIME NOT NULL default CURRENT_TIMESTAMP,
  PRIMARY KEY (`ExID`),
  FOREIGN KEY (`mngID`) REFERENCES `Manager` (`MngID`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;



DROP TABLE IF EXISTS Lot;
CREATE TABLE `Lot` (
  `proID`         bigint(20) NOT NULL default '0',
  `name`          varchar(80) NOT NULL default '',
  `quantity`      varchar(80) NOT NULL default '',
  `Exp`           DATETIME NOT NULL ,
  PRIMARY KEY  (`proID`,`name`),
  FOREIGN KEY (`proID`) REFERENCES `Product` (`PID`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;



DROP TABLE IF EXISTS CatMng;
CREATE TABLE `CatMng` (
  `mngID`         bigint(20) NOT NULL default '0',
  `Mdate`         DATETIME DEFAULT CURRENT_TIMESTAMP,
  `catID`         bigint(20) NOT NULL default '0',
  `Mtype`         enum('create', 'edit', 'delete') NOT NULL,
  PRIMARY KEY (`mngID`,`Mdate`,`catID`),
  FOREIGN KEY (`mngID`) REFERENCES `Manager` (`MngID`),
  FOREIGN KEY (`catID`) REFERENCES `Category` (`CID`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;



DROP TABLE IF EXISTS ShelfMng;
CREATE TABLE `ShelfMng` (
  `mngID`         bigint(20) NOT NULL default '0',
  `Mdate`         DATETIME NOT NULL default CURRENT_TIMESTAMP,
  `shID`          bigint(20) NOT NULL default '0',
  `Mtype`         enum('create', 'edit', 'delete') NOT NULL,
  PRIMARY KEY (`mngID`,`Mdate`,`shID`),
  FOREIGN KEY (`mngID`) REFERENCES `Manager` (`MngID`),
  FOREIGN KEY (`shID`) REFERENCES `shelf` (`ShID`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;



DROP TABLE IF EXISTS SupMng;
CREATE TABLE `SupMng` (
  `mngID`         bigint(20) NOT NULL default '0',
  `Mdate`         DATETIME NOT NULL default CURRENT_TIMESTAMP,
  `supID`         bigint(20) NOT NULL default '0',
  `Mtype`         enum('create', 'edit', 'delete') NOT NULL ,
  PRIMARY KEY (`mngID`,`Mdate`,`supID`),
  FOREIGN KEY (`mngID`) REFERENCES `Manager` (`MngID`),
  FOREIGN KEY (`supID`) REFERENCES `Supplier` (`SupID`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;



DROP TABLE IF EXISTS ProMng;
CREATE TABLE `ProMng` (
  `mngID`         bigint(20) NOT NULL default '0',
  `Mdate`         DATETIME NOT NULL default CURRENT_TIMESTAMP,
  `proID`         bigint(20) NOT NULL default '0',
  `Mtype`         enum('create', 'edit', 'delete') NOT NULL ,
  PRIMARY KEY (`mngID`,`Mdate`,`proID`),
  FOREIGN KEY (`mngID`) REFERENCES `Manager` (`MngID`),
  FOREIGN KEY (`proID`) REFERENCES `Product` (`PID`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;



DROP TABLE IF EXISTS ChangeStateImport;
CREATE TABLE `ChangeStateImport` (
  `mngID`         bigint(20) NOT NULL default '0',
  `date`          DATETIME NOT NULL default CURRENT_TIMESTAMP,
  `impID`          bigint(20) default '0',
  `oldState`      enum('ready', 'excecuted', 'close') NOT NULL ,
  `newState`      enum('ready', 'excecuted', 'close') NOT NULL ,
  PRIMARY KEY (`mngID`,`date`,`impID`),
  FOREIGN KEY (`mngID`) REFERENCES `Manager` (`MngID`),
  FOREIGN KEY (`impID`) REFERENCES `Import` (`ImID`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;



DROP TABLE IF EXISTS ProductStoreAtShelf;
CREATE TABLE `ProductStoreAtShelf` (
  `proID`         bigint(20) NOT NULL default '0',
  `shID`          bigint(20) NOT NULL default '0',
  PRIMARY KEY (`shID`, `proID`),
  FOREIGN KEY (`shID`) REFERENCES `Shelf` (`ShID`),
  FOREIGN KEY (`proID`) REFERENCES `Product` (`PID`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;



DROP TABLE IF EXISTS ProductOnBill;
CREATE TABLE `ProductOnBill` (
  `proID`        bigint(20) NOT NULL default '0',
  `bID`          bigint(20) NOT NULL default '0',
  `quantity`     int(20) NOT NULL default '0'
  PRIMARY KEY (`bID`, `proID`),
  FOREIGN KEY (`bID`) REFERENCES `Shelf` (`BID`),
  FOREIGN KEY (`proID`) REFERENCES `Product` (`PID`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;



DROP TABLE IF EXISTS CatOwnShelf;
CREATE TABLE `CatOwnShelf` (
  `catID`         bigint(20) NOT NULL default '0',
  `shID`          bigint(20) NOT NULL default '0',
  PRIMARY KEY (`shID`, `catID`),
  FOREIGN KEY (`shID`) REFERENCES `Shelf` (`ShID`),
  FOREIGN KEY (`catID`) REFERENCES `Category` (`CID`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;




DROP TABLE IF EXISTS ProductInExport;
CREATE TABLE `ProductInExport` (
  `proID`          bigint(20) NOT NULL default '0',
  `expID`          bigint(20)  default '0',
  `amount`         int(20) NOT NULL default '0',
  PRIMARY KEY (`proID`, `expID`),
  FOREIGN KEY (`expID`) REFERENCES `Export` (`ExID`),
  FOREIGN KEY (`proID`) REFERENCES `Product` (`PID`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;



DROP TABLE IF EXISTS SupplierPhonenumber;
CREATE TABLE `SupplierPhonenumber` (
  `supID`          bigint(20) NOT NULL default '0',
  `phoneNumber`    int(10) ,
  PRIMARY KEY (`supID`, `phoneNumber`),
  FOREIGN KEY (`supID`) REFERENCES `Supplier` (`SupID`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;



DROP TABLE IF EXISTS ManagererPhonenumber;
CREATE TABLE `ManagererPhonenumber` (
  `mngID`          bigint(20) NOT NULL default '0',
  `phoneNumber`    int(10) ,
  PRIMARY KEY (`mngID`, `phoneNumber`),
  FOREIGN KEY (`mngID`) REFERENCES `Manager` (`MngID`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;





DROP TABLE IF EXISTS NormalMNG;
CREATE TABLE `NormalMNG` (
  `mngID`               bigint(20) NOT NULL ,
  PRIMARY KEY (`mngID`),
  FOREIGN KEY (`mngID`) REFERENCES `Manager` (`MngID`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;


DROP TABLE IF EXISTS PrimeMNG;
CREATE TABLE `PrimeMNG` (
  `mngID`         bigint(20) NOT NULL ,
  PRIMARY KEY (`mngID`),
  FOREIGN KEY (`mngID`) REFERENCES `Manager` (`MngID`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;
