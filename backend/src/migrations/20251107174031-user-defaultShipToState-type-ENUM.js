'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Users', 'defaultShipToState', {
      type: Sequelize.ENUM(
        'AL',
        'AK',
        'AZ',
        'AR',
        'CA',
        'CO',
        'CT',
        'DE',
        'FL',
        'GA',
        'HI',
        'ID',
        'IL',
        'IN',
        'IA',
        'KS',
        'KY',
        'LA',
        'ME',
        'MD',
        'MA',
        'MI',
        'MN',
        'MS',
        'MO',
        'MT',
        'NE',
        'NV',
        'NH',
        'NJ',
        'NM',
        'NY',
        'NC',
        'ND',
        'OH',
        'OK',
        'OR',
        'PA',
        'RI',
        'SC',
        'SD',
        'TN',
        'TX',
        'UT',
        'VT',
        'VA',
        'WA',
        'WV',
        'WI',
        'WY'
      ),
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert column back to STRING
    // First, remove ENUM constraint type
    await queryInterface.changeColumn('Users', 'defaultShipToState', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    // Optional: Drop the ENUM type in Postgres to clean up
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_Users_defaultShipToState";'
    );
  },
};
