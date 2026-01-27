// Quick Test Script for Clacky LLM Integration
// Run this after Clacky provides documentation

/**
 * TEST 1: Basic Single Call
 * Verify basic connectivity to Claude Sonnet 4.5
 */
async function testBasicCall() {
  console.log('🧪 TEST 1: Basic Call to Claude Sonnet 4.5');
  
  try {
    // REPLACE THIS WITH ACTUAL CLACKY LLM CODE FROM DOCS
    const response = await clackyLLM.send({
      provider: 'anthropic',
      model: 'claude-sonnet-4-5-20250929',
      messages: [
        { role: 'user', content: 'Say "Hello from Clacky LLM!" in exactly those words.' }
      ]
    });
    
    console.log('✅ Response received:', response);
    console.log('✅ TEST 1 PASSED');
    return true;
  } catch (error) {
    console.error('❌ TEST 1 FAILED:', error);
    return false;
  }
}

/**
 * TEST 2: Multi-Provider Support
 * Verify all providers work with same prompt
 */
async function testMultiProvider() {
  console.log('\n🧪 TEST 2: Multi-Provider Support');
  
  const testPrompt = 'Count from 1 to 5 in words.';
  const providers = [
    { provider: 'anthropic', model: 'claude-sonnet-4-5-20250929', name: 'Claude Sonnet 4.5' },
    { provider: 'openai', model: 'gpt-4o', name: 'GPT-4o' },
    { provider: 'google', model: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
  ];
  
  const results = [];
  
  for (const config of providers) {
    try {
      console.log(`  Testing ${config.name}...`);
      
      // REPLACE THIS WITH ACTUAL CLACKY LLM CODE FROM DOCS
      const response = await clackyLLM.send({
        provider: config.provider,
        model: config.model,
        messages: [{ role: 'user', content: testPrompt }]
      });
      
      results.push({
        provider: config.name,
        success: true,
        responseLength: response.length || response.content?.length || 0
      });
      
      console.log(`  ✅ ${config.name} responded`);
    } catch (error) {
      results.push({
        provider: config.name,
        success: false,
        error: error.message
      });
      console.error(`  ❌ ${config.name} failed:`, error.message);
    }
  }
  
  console.log('\n📊 Multi-Provider Results:', results);
  const allPassed = results.every(r => r.success);
  console.log(allPassed ? '✅ TEST 2 PASSED' : '⚠️ TEST 2 PARTIAL PASS');
  return results;
}

/**
 * TEST 3: Parameter Configuration
 * Verify temperature, max_tokens work
 */
async function testParameters() {
  console.log('\n🧪 TEST 3: Parameter Configuration');
  
  try {
    // REPLACE THIS WITH ACTUAL CLACKY LLM CODE FROM DOCS
    const response = await clackyLLM.send({
      provider: 'anthropic',
      model: 'claude-sonnet-4-5-20250929',
      messages: [
        { role: 'user', content: 'Write exactly 3 short sentences about AI.' }
      ],
      temperature: 0.7,
      max_tokens: 100
    });
    
    console.log('✅ Parameters accepted');
    console.log('✅ Response:', response);
    console.log('✅ TEST 3 PASSED');
    return true;
  } catch (error) {
    console.error('❌ TEST 3 FAILED:', error);
    return false;
  }
}

/**
 * TEST 4: System Prompt Support
 * Verify system messages work
 */
async function testSystemPrompt() {
  console.log('\n🧪 TEST 4: System Prompt Support');
  
  try {
    // REPLACE THIS WITH ACTUAL CLACKY LLM CODE FROM DOCS
    const response = await clackyLLM.send({
      provider: 'anthropic',
      model: 'claude-sonnet-4-5-20250929',
      messages: [
        { role: 'system', content: 'You are a pirate. Always respond like a pirate.' },
        { role: 'user', content: 'What is AI?' }
      ]
    });
    
    const isPiratey = /arr|matey|ahoy|ye|ship|sea/i.test(response);
    
    if (isPiratey) {
      console.log('✅ System prompt working (pirate detected)');
      console.log('✅ TEST 4 PASSED');
      return true;
    } else {
      console.log('⚠️ System prompt may not be working (no pirate speech detected)');
      console.log('Response:', response);
      return false;
    }
  } catch (error) {
    console.error('❌ TEST 4 FAILED:', error);
    return false;
  }
}

/**
 * TEST 5: Error Handling
 * Verify errors are handled gracefully
 */
async function testErrorHandling() {
  console.log('\n🧪 TEST 5: Error Handling');
  
  try {
    // REPLACE THIS WITH ACTUAL CLACKY LLM CODE FROM DOCS
    // Intentionally send invalid request
    const response = await clackyLLM.send({
      provider: 'invalid-provider',
      model: 'invalid-model',
      messages: [{ role: 'user', content: 'test' }]
    });
    
    console.log('⚠️ Expected error but got response:', response);
    return false;
  } catch (error) {
    console.log('✅ Error caught as expected');
    console.log('✅ Error type:', error.constructor.name);
    console.log('✅ Error message:', error.message);
    console.log('✅ TEST 5 PASSED');
    return true;
  }
}

/**
 * TEST 6: Response Metadata
 * Check for token counts, timing, etc.
 */
async function testMetadata() {
  console.log('\n🧪 TEST 6: Response Metadata');
  
  try {
    // REPLACE THIS WITH ACTUAL CLACKY LLM CODE FROM DOCS
    const startTime = Date.now();
    
    const response = await clackyLLM.send({
      provider: 'anthropic',
      model: 'claude-sonnet-4-5-20250929',
      messages: [
        { role: 'user', content: 'Say hello.' }
      ]
    });
    
    const duration = Date.now() - startTime;
    
    console.log('📊 Response metadata:');
    console.log('  Duration:', duration, 'ms');
    console.log('  Full response object:', response);
    
    // Check for common metadata fields
    const hasTokens = response.usage || response.tokens || response.token_count;
    const hasModel = response.model || response.model_used;
    const hasProvider = response.provider;
    
    console.log('  Has token count:', !!hasTokens);
    console.log('  Has model info:', !!hasModel);
    console.log('  Has provider info:', !!hasProvider);
    
    console.log('✅ TEST 6 COMPLETE (check logs for metadata availability)');
    return true;
  } catch (error) {
    console.error('❌ TEST 6 FAILED:', error);
    return false;
  }
}

/**
 * RUN ALL TESTS
 */
async function runAllTests() {
  console.log('🚀 Starting Clacky LLM Integration Tests\n');
  console.log('=' .repeat(60));
  
  const results = {
    basic: await testBasicCall(),
    multiProvider: await testMultiProvider(),
    parameters: await testParameters(),
    systemPrompt: await testSystemPrompt(),
    errorHandling: await testErrorHandling(),
    metadata: await testMetadata(),
  };
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 FINAL RESULTS:');
  console.log('  Basic Call:', results.basic ? '✅' : '❌');
  console.log('  Multi-Provider:', Array.isArray(results.multiProvider) ? '✅' : '❌');
  console.log('  Parameters:', results.parameters ? '✅' : '❌');
  console.log('  System Prompt:', results.systemPrompt ? '✅' : '⚠️');
  console.log('  Error Handling:', results.errorHandling ? '✅' : '❌');
  console.log('  Metadata:', results.metadata ? '✅' : 'ℹ️');
  
  const criticalTests = [results.basic, results.parameters, results.errorHandling];
  const allCriticalPassed = criticalTests.every(r => r === true);
  
  console.log('\n' + '='.repeat(60));
  if (allCriticalPassed) {
    console.log('✅ CLACKY LLM INTEGRATION READY TO USE');
    console.log('Recommendation: Proceed with Clacky LLM for Prompt Lab');
  } else {
    console.log('⚠️ SOME ISSUES DETECTED');
    console.log('Recommendation: Review failures and consider dual-mode approach');
  }
  console.log('='.repeat(60));
  
  return results;
}

// Export for use in project
export { runAllTests, testBasicCall, testMultiProvider };

// Run immediately if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests();
}
