#!/usr/bin/env bash
# Place in .platform/hooks/postdeploy directory
sudo certbot -n -d WebDevConnect.us-east-1.elasticbeanstalk.com  --nginx --agree-tos --email jassinfosystems@gmail.com
