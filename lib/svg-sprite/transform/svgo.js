/**
 * svg-sprite is a Node.js module for creating SVG sprites
 *
 * @see https://github.com/svg-sprite/svg-sprite
 *
 * @author Joschi Kuphal <joschi@kuphal.net> (https://github.com/jkphl)
 * @copyright © 2018 Joschi Kuphal
 * @license MIT https://github.com/svg-sprite/svg-sprite/blob/main/LICENSE
 */

'use strict';

const svgo = require('svgo');
const _ = require('lodash');
const pretty = require('prettysize');

/**
 * SVGO transformation
 *
 * @param {SVGShape} shape                SVG shape
 * @param {Object} config                 Transform configuration
 * @param {SVGSpriter} spriter            Spriter instance
 * @param {Function} cb                   Callback
 */
module.exports = function(shape, config, spriter, cb) {
    const defaultPluginsConfig = [{
        name: 'preset-default'
    }];

    config = _.cloneDeep(config);
    config.plugins = 'plugins' in config ? config.plugins : defaultPluginsConfig;

    if (!spriter.config.svg.xmlDeclaration) {
        config.plugins.push('removeXMLProcInst');
    }

    if (!spriter.config.svg.doctypeDeclaration) {
        config.plugins.push('removeDoctype');
    }

    const svg = shape.getSVG(false);
    const svgLength = svg.length;

    try {
        const result = svgo.optimize(svg, config);
        shape.setSVG(result.data);
        let optSVGLength = null;
        for (const transport of spriter.config.log.transports) {
            if (transport.level === 'debug') {
                optSVGLength = optSVGLength || shape.getSVG(false).length;
                spriter.debug('Optimized "%s" with SVGO (saved %s / %s%%)', shape.name, pretty(svgLength - optSVGLength), Math.round(100 * (svgLength - optSVGLength) / svgLength));
            }
        }

        cb(null);
    } catch (error) {
        spriter.error('Optimizing "%s" with SVGO failed with error "%s"', shape.name, error);
        cb(error);
    }
};
