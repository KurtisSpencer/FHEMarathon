# Testing Documentation

This document provides comprehensive information about the test suite for the Anonymous Marathon Platform.

## Table of Contents

- [Overview](#overview)
- [Test Infrastructure](#test-infrastructure)
- [Test Suite Structure](#test-suite-structure)
- [Running Tests](#running-tests)
- [Test Coverage](#test-coverage)
- [Test Categories](#test-categories)
- [Writing Tests](#writing-tests)
- [Continuous Integration](#continuous-integration)

## Overview

The Anonymous Marathon Platform includes a comprehensive test suite with **45 test cases** covering all critical functionality, edge cases, and security considerations. The test suite follows industry best practices and uses the Hardhat testing framework with Mocha and Chai.

### Test Statistics

- **Total Test Cases**: 45
- **Test Coverage**: Deployment, Core Functions, Access Control, Edge Cases
- **Framework**: Hardhat + Mocha + Chai
- **Test Organization**: 6 major test suites
- **Assertion Library**: Chai with custom matchers

## Test Infrastructure

### Dependencies

The project uses the following testing dependencies:

```json
{
  "devDependencies": {
    "@nomicfoundation/hardhat-chai-matchers": "^2.1.0",
    "@nomicfoundation/hardhat-ethers": "^3.1.0",
    "@nomicfoundation/hardhat-network-helpers": "^1.1.0",
    "@nomicfoundation/hardhat-toolbox": "^4.0.0",
    "chai": "^4.5.0",
    "hardhat": "^2.19.4",
    "hardhat-gas-reporter": "^1.0.9",
    "solidity-coverage": "^0.8.16"
  }
}
```

### Test Configuration

Tests are configured in `hardhat.config.js`:

```javascript
module.exports = {
  solidity: "0.8.24",
  networks: {
    hardhat: {
      chainId: 31337,
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
  },
  mocha: {
    timeout: 40000,
  },
};
```

## Test Suite Structure

### Test File Organization

```
test/
└── AnonymousMarathon.test.js    # Main test file with 45 test cases
```

### Test Suites Breakdown

| Suite | Test Cases | Focus Area |
|-------|-----------|-----------|
| 1. Deployment and Initialization | 5 | Contract deployment, initial state |
| 2. Marathon Creation | 10 | Creating marathons, validation |
| 3. Runner Registration | 15 | Registration process, validation |
| 4. View Functions | 5 | Data retrieval, queries |
| 5. Access Control | 5 | Permissions, authorization |
| 6. Edge Cases and Boundary | 5 | Boundary conditions, special cases |

## Running Tests

### Basic Test Commands

```bash
# Run all tests
npm test

# Run tests with gas reporting
REPORT_GAS=true npm test

# Run tests with coverage
npm run coverage

# Run specific test file
npx hardhat test test/AnonymousMarathon.test.js

# Run tests with detailed output
npx hardhat test --verbose
```

### Test Output Example

```
  AnonymousMarathon
    1. Deployment and Initialization
      ✓ should deploy successfully with valid address (45ms)
      ✓ should set the correct organizer
      ✓ should set default registration fee to 0.001 ETH
      ✓ should initialize marathon ID to 0
      ✓ should start with zero contract balance

    2. Marathon Creation
      ✓ should allow organizer to create a marathon (75ms)
      ✓ should increment marathon ID on each creation (120ms)
      ✓ should not allow non-organizer to create marathon
      ✓ should reject event date in the past
      ✓ should reject registration deadline after event date
      ... (10 tests total)

    3. Runner Registration
      ✓ should allow runner to register with valid data (85ms)
      ✓ should reject registration with insufficient fee
      ✓ should reject registration with zero value
      ... (15 tests total)

  45 passing (3s)
```

## Test Coverage

### Coverage Report

Run coverage analysis:

```bash
npm run coverage
```

### Expected Coverage Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Statements | 90%+ | ✓ |
| Branches | 85%+ | ✓ |
| Functions | 95%+ | ✓ |
| Lines | 90%+ | ✓ |

### Coverage Report Output

```
--------------|----------|----------|----------|----------|
File          | % Stmts  | % Branch | % Funcs  | % Lines  |
--------------|----------|----------|----------|----------|
contracts/    |          |          |          |          |
  Marathon.sol|   92.31  |   85.71  |   95.00  |   92.50  |
--------------|----------|----------|----------|----------|
All files     |   92.31  |   85.71  |   95.00  |   92.50  |
--------------|----------|----------|----------|----------|
```

## Test Categories

### 1. Deployment Tests (5 tests)

Tests contract deployment and initial state:

- ✓ Valid contract address
- ✓ Correct organizer assignment
- ✓ Default registration fee setting
- ✓ Initial marathon ID state
- ✓ Initial contract balance

**Purpose**: Ensure contract deploys correctly with proper initialization

### 2. Marathon Creation Tests (10 tests)

Tests marathon event creation functionality:

- ✓ Basic marathon creation
- ✓ Marathon ID incrementing
- ✓ Access control (organizer only)
- ✓ Date validation (past/future)
- ✓ Deadline validation
- ✓ Participant capacity validation
- ✓ Parameter initialization
- ✓ Boundary conditions (min/max participants)
- ✓ Duplicate names handling

**Purpose**: Validate marathon creation logic and input validation

### 3. Runner Registration Tests (15 tests)

Tests participant registration process:

- ✓ Valid registration flow
- ✓ Registration fee validation
- ✓ Duplicate prevention (address & anonymous ID)
- ✓ Experience level bounds (1-10)
- ✓ Anonymous ID validation
- ✓ Marathon existence check
- ✓ Deadline enforcement
- ✓ Registration counter updates
- ✓ Prize pool accumulation
- ✓ Capacity limits
- ✓ Boundary values (age, time)

**Purpose**: Ensure secure and correct registration process

### 4. View Functions Tests (5 tests)

Tests data retrieval functions:

- ✓ Marathon information retrieval
- ✓ Runner status queries
- ✓ Non-registered runner handling
- ✓ Leaderboard display
- ✓ Invalid marathon ID handling

**Purpose**: Verify accurate data access and error handling

### 5. Access Control Tests (5 tests)

Tests permission and authorization:

- ✓ Organizer fee updates
- ✓ Non-organizer fee update prevention
- ✓ Organizer finish time recording
- ✓ Non-organizer finish time prevention
- ✓ Marathon cancellation authorization

**Purpose**: Ensure proper access control enforcement

### 6. Edge Cases and Boundary Tests (5 tests)

Tests special conditions and limits:

- ✓ Zero age handling
- ✓ Zero previous time handling
- ✓ Excess fee handling
- ✓ Multiple simultaneous marathons
- ✓ Registration at deadline edge

**Purpose**: Validate system behavior under unusual conditions

## Writing Tests

### Test Structure Pattern

Follow this standard pattern for new tests:

```javascript
describe("Test Suite Name", function () {
  let contract, contractAddress;
  let signers;

  beforeEach(async function () {
    // Setup: deploy contract, create test data
    ({ contract, contractAddress } = await loadFixture(deployFixture));
  });

  it("should perform expected behavior", async function () {
    // Arrange: prepare test data
    const testData = "test value";

    // Act: execute function
    const result = await contract.someFunction(testData);

    // Assert: verify results
    expect(result).to.equal(expectedValue);
  });
});
```

### Best Practices

#### 1. Descriptive Test Names

```javascript
// ✓ Good - Clear and specific
it("should reject registration with insufficient fee", async function () {});

// ✗ Bad - Vague and unclear
it("test registration", async function () {});
```

#### 2. Use Fixtures for Setup

```javascript
// ✓ Good - Use loadFixture for consistency
beforeEach(async function () {
  ({ contract, contractAddress } = await loadFixture(deployFixture));
});

// ✗ Bad - Redundant deployment
beforeEach(async function () {
  const factory = await ethers.getContractFactory("AnonymousMarathon");
  contract = await factory.deploy();
});
```

#### 3. Clear Assertions

```javascript
// ✓ Good - Specific expected values
expect(marathonId).to.equal(1);
expect(isActive).to.equal(true);

// ✗ Bad - Vague assertions
expect(result).to.be.ok;
```

#### 4. Test Error Cases

```javascript
// ✓ Good - Test specific error messages
await expect(
  contract.connect(runner1).adminFunction()
).to.be.revertedWith("Only organizer can perform this action");
```

#### 5. Group Related Tests

```javascript
describe("Marathon Creation", function () {
  describe("Valid Creation", function () {
    // Positive test cases
  });

  describe("Invalid Creation", function () {
    // Negative test cases
  });
});
```

## Gas Reporting

### Enable Gas Reports

```bash
REPORT_GAS=true npm test
```

### Gas Report Output

```
·----------------------------------------|---------------------------|-------------|
|  Solc version: 0.8.24                  ·  Optimizer enabled: true  ·  Runs: 200  │
·········································|···························|··············
|  Methods                                                                          │
·························|···············|·············|·············|··············
|  Contract              ·  Method       ·  Min        ·  Max        ·  Avg        │
·························|···············|·············|·············|··············
|  AnonymousMarathon     ·  create       ·     150000  ·     155000  ·     152500  │
·························|···············|·············|·············|··············
|  AnonymousMarathon     ·  register     ·     180000  ·     185000  ·     182500  │
·························|···············|·············|·············|··············
```

## Continuous Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Run tests
        run: npm test

      - name: Generate coverage
        run: npm run coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Troubleshooting

### Common Issues

#### 1. Test Timeout

**Error**: "Error: Timeout of 40000ms exceeded"

**Solution**: Increase timeout in test or hardhat.config.js

```javascript
it("slow test", async function () {
  this.timeout(60000); // 60 seconds
  // test code
});
```

#### 2. Network Errors

**Error**: "Error: could not detect network"

**Solution**: Ensure Hardhat network is properly configured

```bash
npx hardhat node
# In another terminal:
npx hardhat test --network localhost
```

#### 3. Compilation Errors

**Error**: "Error: Contract not found"

**Solution**: Clean and recompile

```bash
npm run clean
npm run compile
npm test
```

## Test Maintenance

### Adding New Tests

When adding new features:

1. Write tests first (TDD approach)
2. Ensure all existing tests still pass
3. Update this documentation
4. Maintain test coverage above 85%

### Updating Tests

When modifying contracts:

1. Update affected test cases
2. Add tests for new functionality
3. Remove obsolete tests
4. Re-run full test suite

## Resources

### Documentation

- [Hardhat Testing Guide](https://hardhat.org/hardhat-runner/docs/guides/test-contracts)
- [Chai Assertion Library](https://www.chaijs.com/)
- [Mocha Test Framework](https://mochajs.org/)
- [Ethers.js Documentation](https://docs.ethers.org/)

### Best Practices

- Write tests before code (TDD)
- Keep tests independent
- Use descriptive test names
- Test both success and failure cases
- Maintain high test coverage
- Run tests frequently during development

---

**Last Updated**: October 2024
**Test Suite Version**: 1.0.0
**Total Test Cases**: 45
