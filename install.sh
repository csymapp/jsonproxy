#!/bin/bash

cp -r lib /

systemctl enable jsonproxy.service
systemctl daemon-reload
systemctl start jsonproxy