import assert from 'node:assert/strict';
import test from 'node:test';
import { applyPropertySearchFilters, buildPublishedPropertyFilterSpecs } from '../src/lib/propertySearch.js';

const defaults = {
  transaction: 'Buy', propertyType: 'Any property', locality: 'Flexible / nearby', budget: '',
  minimumDeposit: '', minimumArea: '', maximumArea: '', furnishing: 'Any furnishing',
};

test('published property search always includes only published rows and applies buy filters', () => {
  assert.deepEqual(buildPublishedPropertyFilterSpecs({ ...defaults, propertyType: '2 BHK', budget: '8500000' }), [
    ['eq', 'status', 'published'],
    ['eq', 'transaction_type', 'sale'],
    ['eq', 'bedrooms', 2],
    ['lte', 'price', 8500000],
  ]);
});

test('rental price uses the same filter and minimum deposit applies only to rent', () => {
  assert.deepEqual(buildPublishedPropertyFilterSpecs({ ...defaults, transaction: 'Rent', budget: '25000', minimumDeposit: '100000' }), [
    ['eq', 'status', 'published'],
    ['eq', 'transaction_type', 'rent'],
    ['lte', 'price', 25000],
    ['gte', 'deposit', 100000],
  ]);
  assert.equal(buildPublishedPropertyFilterSpecs({ ...defaults, minimumDeposit: '100000' }).some(([, column]) => column === 'deposit'), false);
});

test('locality, commercial type, area bounds and furnishing combine without residential BHK filters', () => {
  assert.deepEqual(buildPublishedPropertyFilterSpecs({
    ...defaults,
    transaction: 'Commercial',
    commercialTransaction: 'rent',
    propertyType: '3 BHK or larger',
    locality: 'Mira Road East',
    minimumArea: '500',
    maximumArea: '2500',
    furnishing: 'semi-furnished',
  }), [
    ['eq', 'status', 'published'],
    ['eq', 'property_type', 'commercial'],
    ['eq', 'transaction_type', 'rent'],
    ['ilike', 'locality.name', '%Mira Road East%'],
    ['gte', 'area_sqft', 500],
    ['lte', 'area_sqft', 2500],
    ['eq', 'furnishing', 'semi-furnished'],
  ]);
});

test('commercial inventory uses one transaction and matching budget/deposit units at a time', () => {
  assert.deepEqual(buildPublishedPropertyFilterSpecs({
    ...defaults,
    transaction: 'Commercial',
    commercialTransaction: 'rent',
    budget: '90000',
    minimumDeposit: '200000',
  }), [
    ['eq', 'status', 'published'],
    ['eq', 'property_type', 'commercial'],
    ['eq', 'transaction_type', 'rent'],
    ['lte', 'price', 90000],
    ['gte', 'deposit', 200000],
  ]);
  assert.deepEqual(buildPublishedPropertyFilterSpecs({ ...defaults, transaction: 'Commercial', commercialTransaction: 'sale' }).slice(0, 3), [
    ['eq', 'status', 'published'],
    ['eq', 'property_type', 'commercial'],
    ['eq', 'transaction_type', 'sale'],
  ]);
});

test('filter specifications are applied to the query in their declared order', () => {
  const calls = [];
  const query = Object.fromEntries(['eq', 'gte', 'lte', 'ilike'].map((method) => [method, (...args) => { calls.push([method, ...args]); return query; }]));
  applyPropertySearchFilters(query, { ...defaults, locality: 'Kashimira' });
  assert.deepEqual(calls, [['eq', 'status', 'published'], ['eq', 'transaction_type', 'sale'], ['ilike', 'locality.name', '%Kashimira%']]);
});
