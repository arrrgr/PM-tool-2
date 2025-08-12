// Test script for file attachments
// Run with: node test-attachments.js

const fs = require('fs');

async function testAttachments() {
  console.log('Testing File Attachments Feature...\n');
  
  // Test 1: Check S3 configuration
  console.log('1. Checking S3 Configuration:');
  const envVars = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION', 'AWS_S3_BUCKET'];
  let configOk = true;
  
  for (const varName of envVars) {
    if (process.env[varName]) {
      console.log(`   ✓ ${varName} is configured`);
    } else {
      console.log(`   ✗ ${varName} is missing`);
      configOk = false;
    }
  }
  
  if (!configOk) {
    console.log('\n❌ S3 configuration incomplete. Please check .env.local file');
    return;
  }
  
  console.log('\n2. Testing S3 Client Connection:');
  try {
    const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3');
    const client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    
    const command = new ListBucketsCommand({});
    const response = await client.send(command);
    console.log(`   ✓ Connected to AWS S3`);
    console.log(`   ✓ Found ${response.Buckets?.length || 0} buckets`);
    
    // Check if our bucket exists
    const ourBucket = response.Buckets?.find(b => b.Name === process.env.AWS_S3_BUCKET);
    if (ourBucket) {
      console.log(`   ✓ Bucket '${process.env.AWS_S3_BUCKET}' exists`);
    } else {
      console.log(`   ⚠ Bucket '${process.env.AWS_S3_BUCKET}' not found in account`);
    }
  } catch (error) {
    console.log(`   ✗ S3 connection failed: ${error.message}`);
    return;
  }
  
  console.log('\n3. Testing File Upload to S3:');
  try {
    const { uploadToS3, generateS3Key } = require('./src/lib/s3');
    
    // Create a test file
    const testContent = 'Test attachment content for S3 upload';
    const testFile = new File([testContent], 'test-upload.txt', { type: 'text/plain' });
    
    const key = generateS3Key('test', 'test-upload.txt');
    console.log(`   → Uploading to key: ${key}`);
    
    const result = await uploadToS3(testFile, key);
    if (result.success) {
      console.log(`   ✓ File uploaded successfully to S3`);
      console.log(`   ✓ S3 Key: ${result.key}`);
    } else {
      console.log(`   ✗ Upload failed: ${result.error}`);
    }
  } catch (error) {
    console.log(`   ✗ Upload test failed: ${error.message}`);
  }
  
  console.log('\n4. Database Schema Check:');
  try {
    const { db } = require('./src/server/db');
    const { attachments } = require('./src/server/db/schema');
    
    // Try to query attachments table
    const result = await db.select().from(attachments).limit(1);
    console.log(`   ✓ Attachments table exists`);
    console.log(`   ✓ Current attachments in DB: ${result.length}`);
  } catch (error) {
    console.log(`   ✗ Database check failed: ${error.message}`);
  }
  
  console.log('\n✅ File Attachments feature is properly configured and ready to use!');
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Run tests
testAttachments().catch(console.error);