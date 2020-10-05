const connectionsLocal = require('../data/connectionsLocal');

exports.seed = function(knex) {
  return knex('connections')
    .del()
    .then(function() {
      return knex('connections').insert(connectionsLocal);
    });
};
