# 🎮 Minecraft Ultimate Bot Rotation System with Auto-Bed Placement

## 🌟 Overview
A sophisticated 24/7 Minecraft bot rotation system that maintains continuous player presence on Aternos servers. Now with **automatic bed placement** - bots will place beds and sleep immediately when night comes!

![Status](https://img.shields.io/badge/Status-Operational%20with%20Auto--Bed-brightgreen)
![Version](https://img.shields.io/badge/Version-2.1.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-16+-green)

## 🚀 Live Demo
**Service URL**: `https://aternos-24-7-bots-u7ir.onrender.com`  
**Health Check**: `https://aternos-24-7-bots-u7ir.onrender.com/health`  
**Server**: `gameplanet.aternos.me:51270` (Minecraft 1.21.10)

## ✨ Enhanced Features

### 🛏️ AUTO-BED PLACEMENT SYSTEM
- **Immediate Bed Placement**: Bots automatically place beds when night comes
- **Smart Location Finding**: Finds suitable 2x1 area for bed placement
- **Inventory Management**: Uses beds from inventory or searches for materials
- **Sleep Priority**: Immediately prioritizes sleeping when night detected
- **Bed Persistence**: Remembers bed locations between activities

### 🔄 Smart Rotation System
- Single Bot Operation - Only one bot online at a time
- 2-3 Hour Sessions - Realistic play durations  
- 5-15 Minute Breaks - Natural intervals between sessions
- Continuous 24/7 - Never-ending operation

### 🌍 Virtual IP Switching
- Multiple Locations: US, UK, Canada, Germany, France, Japan
- IP Rotation - Different virtual IP for each session
- Geographic Diversity - Appears as players from around the world

### 🤖 Advanced AI Personalities

#### 🕵️ AGENT Bot
- Military/operative personality
- Auto-combat with tactical movement
- Mission-focused behavior
- **Bed Placement**: "Establishing sleeping quarters!"

#### 🌱 CROPTON Bot  
- Farmer/agricultural personality
- Farming simulation with planting actions
- Friendly social behavior
- **Bed Placement**: "Setting up for a good night's rest!"

## 🛠️ Complete Setup Guide

### Step 1: Create Project Files
Create these 3 files in your project folder:

#### 📄 package.json
```json
{
  "name": "aternos-ultimate-rotation",
  "version": "1.0.0",
  "description": "Ultimate bot rotation system with auto-bed placement",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "mineflayer": "^4.15.1"
  },
  "keywords": ["minecraft", "bot", "aternos", "rotation", "ai", "auto-sleep"],
  "author": "Your Name",
  "license": "MIT"
}
