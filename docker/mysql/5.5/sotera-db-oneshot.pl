#!/usr/bin/perl
@databases = `mysql -uroot -proot -e 'show databases;'`;
foreach $database (@databases){
	if($database =~ /memex_sotera/){
		die;
	}
}
`mysql -uroot -proot < /build_populated_db.sql`;
