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
  `telephoneNumber`           varchar(20),
  `Address`                   varchar(80) NOT NULL default '',
  `BDay`                      DATETIME,
  `gender`                    enum('male', 'female', 'other') default 'male',
  `email`                     varchar(80) default '',
  `salary`                    bigint(20),
  `avt_url`                   text,
  `date_start_working`        DATETIME NOT NULL default CURRENT_TIMESTAMP,
  `managerType`               enum('normal', 'prime') default 'normal',
  `createdAt`                 DATETIME NOT NULL default CURRENT_TIMESTAMP,
  `updatedAt`                 DATETIME NOT NULL default CURRENT_TIMESTAMP,
  PRIMARY KEY  (`MngID`),
  UNIQUE  KEY `accountName` (`accountName`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;


DROP TABLE IF EXISTS Shelf;
CREATE TABLE `Shelf` (
  `ShID`          bigint(20) NOT NULL auto_increment,
  `name`          varchar(80) NOT NULL default '',
  `type`          enum('small', 'medium', 'large') default 'small',
  `location`      enum('ware_house', 'store') default 'store',
  `state`         enum('full', 'available') NOT NULL default 'available',
  `createdAt`     DATETIME NOT NULL default CURRENT_TIMESTAMP,
  `updatedAt`     DATETIME NOT NULL default CURRENT_TIMESTAMP,
  PRIMARY KEY  (`ShID`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;


DROP TABLE IF EXISTS Category;
CREATE TABLE `Category` (
  `CID`           bigint(20) NOT NULL auto_increment,
  `name`          varchar(80) NOT NULL default '',
  `img_url`             text NOT NULL,
  `createdAt`     DATETIME NOT NULL default CURRENT_TIMESTAMP,
  `updatedAt`     DATETIME NOT NULL default CURRENT_TIMESTAMP,
  PRIMARY KEY  (`CID`)
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
  `qtt_per_unit`      int(20) NOT NULL default '1',
  `sell_price`        bigint(20) NOT NULL default '0',
  `import_price`      bigint(20) NOT NULL default '0',
  `brand`             varchar(80) NOT NULL default '',
  `categoryId`        bigint(20) NOT NULL default '0',
  `createdAt`         DATETIME NOT NULL default CURRENT_TIMESTAMP,
  `updatedAt`         DATETIME NOT NULL default CURRENT_TIMESTAMP,
  PRIMARY KEY  (`PID`),
  FOREIGN KEY (`catID`) REFERENCES `Category` (`CID`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;


DROP TABLE IF EXISTS Bill;
CREATE TABLE `Bill` (
  `BID`           bigint(20) NOT NULL auto_increment,
  `cus_name`      varchar(80),
  `total`         bigint(20),
  `M_ID`          bigint(20),
  `createdAt`     DATETIME NOT NULL default CURRENT_TIMESTAMP,
  `updatedAt`     DATETIME NOT NULL default CURRENT_TIMESTAMP,
  PRIMARY KEY  (`BID`),
  FOREIGN KEY (`M_ID`) REFERENCES `Manager` (`MngID`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;


DROP TABLE IF EXISTS Discount;
CREATE TABLE `Discount` (
  `DiscountID`              bigint(20) NOT NULL auto_increment,
  `discount_code`           varchar(10) NOT NULL,
  `rate`                    int(5) NOT NULL,
  `title`                   varchar(80) NOT NULL,
  `description`             text,
  `start_date`              DATETIME NOT NULL,
  `end_date`                DATETIME NOT NULL,
  `createdAt`               DATETIME NOT NULL default CURRENT_TIMESTAMP,
  `updatedAt`               DATETIME NOT NULL default CURRENT_TIMESTAMP,
  PRIMARY KEY  (`Discount_ID`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;


DROP TABLE IF EXISTS Supplier;
CREATE TABLE `Supplier` (
  `SupID`             bigint(20) NOT NULL auto_increment,
  `name`              varchar(80) NOT NULL default '',
  `Address`           varchar(80) NOT NULL default '',
  `Tax_ID`            int(20) NOT NULL default '0',
  `Email`             varchar(40) NOT NULL default '',
  `telephoneNumber`   varchar(20),
  `createdAt`         DATETIME NOT NULL default CURRENT_TIMESTAMP,
  `updatedAt`         DATETIME NOT NULL default CURRENT_TIMESTAMP,
  PRIMARY KEY  (`SupID`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;


DROP TABLE IF EXISTS Import;
CREATE TABLE `Import` (
  `ImID`          bigint(20) NOT NULL auto_increment,
  `mngID`         bigint(20) NOT NULL,
  `total`         bigint(20),
  `date`          DATETIME NOT NULL default CURRENT_TIMESTAMP,
  `state`         enum('ready', 'executed', 'close') ,
  `urgent_level`  enum('normal', 'priority')  ,
  `checkerID`     bigint(20),
  `bonus`         text,
  `createdAt`     DATETIME NOT NULL default CURRENT_TIMESTAMP,
  `updatedAt`     DATETIME NOT NULL default CURRENT_TIMESTAMP,
  PRIMARY KEY (`ImID`),
  FOREIGN KEY (`mngID`) REFERENCES `Manager` (`MngID`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;


DROP TABLE IF EXISTS Export;
CREATE TABLE `Export` (
  `ExID`          bigint(20) NOT NULL auto_increment,
  `mngID`         bigint(20) NOT NULL default '0',
  `state`         enum('ready', 'executed', 'close')  ,
  `urgent_level`  enum('normal', 'priority')  ,
  `date`          DATETIME NOT NULL default CURRENT_TIMESTAMP,
  `createdAt`     DATETIME NOT NULL default CURRENT_TIMESTAMP,
  `updatedAt`     DATETIME NOT NULL default CURRENT_TIMESTAMP,
  PRIMARY KEY (`ExID`),
  FOREIGN KEY (`mngID`) REFERENCES `Manager` (`MngID`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;



DROP TABLE IF EXISTS Lot;
CREATE TABLE `Lot` (
  `proID`         bigint(20) NOT NULL default '0',
  `name`          varchar(80) NOT NULL default '',
  `quantity`      varchar(80) NOT NULL default '',
  `Exp`           DATETIME NOT NULL ,
  `createdAt`     DATETIME NOT NULL default CURRENT_TIMESTAMP,
  `updatedAt`     DATETIME NOT NULL default CURRENT_TIMESTAMP,
  PRIMARY KEY  (`proID`,`name`),
  FOREIGN KEY (`proID`) REFERENCES `Product` (`PID`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;



DROP TABLE IF EXISTS ProductStoreAtShelf;
CREATE TABLE `ProductStoreAtShelf` (
  `proID`         bigint(20) NOT NULL default '0',
  `shID`          bigint(20) NOT NULL default '0',
  `createdAt`     DATETIME NOT NULL default CURRENT_TIMESTAMP,
  PRIMARY KEY (`shID`, `proID`),
  FOREIGN KEY (`shID`) REFERENCES `Shelf` (`ShID`),
  FOREIGN KEY (`proID`) REFERENCES `Product` (`PID`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;



DROP TABLE IF EXISTS ProductOnBill;
CREATE TABLE `ProductOnBill` (
  `proID`        bigint(20) NOT NULL default '0',
  `bID`          bigint(20) NOT NULL default '0',
  `quantity`     int(20) NOT NULL default '0',
  `createdAt`     DATETIME NOT NULL default CURRENT_TIMESTAMP,
  PRIMARY KEY (`bID`, `proID`),
  FOREIGN KEY (`bID`) REFERENCES `Shelf` (`BID`),
  FOREIGN KEY (`proID`) REFERENCES `Product` (`PID`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;


DROP TABLE IF EXISTS ProductOnDiscount;
CREATE TABLE `ProductOnDiscount` (
  `proID`               bigint(20) NOT NULL default '0',
  `DiscountID`          bigint(20) NOT NULL default '0',
  `RequirementQuanlity` bigint(20) NOT NULL default 0,
  `createdAt`     DATETIME NOT NULL default CURRENT_TIMESTAMP,
  `updatedAt`     DATETIME NOT NULL default CURRENT_TIMESTAMP,
  PRIMARY KEY (`DiscountID`, `proID`),
  FOREIGN KEY (`DiscountID`) REFERENCES `Discount` (`Discount_ID`),
  FOREIGN KEY (`proID`) REFERENCES `Product` (`PID`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;


DROP TABLE IF EXISTS CatOwnShelf;
CREATE TABLE `CatOwnShelf` (
  `catID`         bigint(20) NOT NULL default '0',
  `shID`          bigint(20) NOT NULL default '0',
  `createdAt`     DATETIME NOT NULL default CURRENT_TIMESTAMP,
  PRIMARY KEY (`shID`, `catID`),
  FOREIGN KEY (`shID`) REFERENCES `Shelf` (`ShID`),
  FOREIGN KEY (`catID`) REFERENCES `Category` (`CID`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;


DROP TABLE IF EXISTS ProductInExport;
CREATE TABLE `ProductInExport` (
  `proID`          bigint(20) NOT NULL default '0',
  `lotID`          bigint(20) NOT NULL default '0',
  `expID`          bigint(20)  default '0',
  `amount`         int(20) NOT NULL default '0',
  `createdAt`     DATETIME NOT NULL default CURRENT_TIMESTAMP,
  PRIMARY KEY (`proID`, `expID`, `lotID`),
  FOREIGN KEY (`expID`) REFERENCES `Export` (`ExID`),
  FOREIGN KEY (`lotID`) REFERENCES `Lot` (`lotID`),
  FOREIGN KEY (`proID`) REFERENCES `Product` (`PID`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;


DROP TABLE IF EXISTS ProductInImport;
CREATE TABLE `ProductInImport` (
  `proID`                       bigint(20) NOT NULL default '0',
  `imID`                        bigint(20)  default '0',
  `amount`                      int(20) NOT NULL default '0',
  `import_price`                bigint(20) NOT NULL default '0',
  `createdAt`                   DATETIME NOT NULL default CURRENT_TIMESTAMP,
  PRIMARY KEY (`proID`, `imID`),
  FOREIGN KEY (`imID`) REFERENCES `Import` (`ImID`),
  FOREIGN KEY (`proID`) REFERENCES `Product` (`PID`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;


DROP TABLE IF EXISTS Logs;
CREATE TABLE `Logs` (
  `id`            bigint(20) NOT NULL auto_increment,
  `MngID`         bigint(20) NOT NULL,    
  `action`        enum('Thêm', 'Sửa', 'Xoá') NOT NULL ,
  `tableOfAction` enum('Hoá đơn', 'Loại hàng', 'Xuất hàng', 'Nhập hàng', 'Lô hàng', 'Quản lý', 'Sản phẩm', 'Kệ hàng', 'Nhà cung cấp') NOT NULL ,
  `affectedRowID` bigint(20) NOT NULL ,
  `nameInRow`     varchar(80) NOT NULL default '',
  `createdAt`     DATETIME NOT NULL default CURRENT_TIMESTAMP,
  PRIMARY KEY  (`id`),
  FOREIGN KEY (`MngID`) REFERENCES `Manager` (`MngID`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;


INSERT INTO Manager
  (FName, LName, accountName, password, Address, BDay,date_start_working, managerType) 
VALUES
  ("Admin", "", "admin",  "$2b$10$/vEpr7cQewqynPD38Om1yuvQflO5AfVNdIiRpqCSIVNxPfd/vogiG", "102 Xóm Chiếu", CURRENT_TIMESTAMP,CURRENT_TIMESTAMP, "prime");
