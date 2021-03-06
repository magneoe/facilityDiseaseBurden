"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var GeoJSON_util_1 = require("../../utils/GeoJSON.util");
var MapObjectFactory_util_1 = require("../../utils/MapObjectFactory.util");
var core_2 = require("angular2-logger/core");
var MapObjectType_enum_1 = require("../../enums/MapObjectType.enum");
var MapService = (function () {
    function MapService(_logger) {
        this._logger = _logger;
    }
    /*
     * Initates the map and returns the reference to it
     */
    MapService.prototype.initMap = function (L, mapId) {
        var map = L.map(mapId, {
            fullscreenControl: true,
            fullscreenControlOptions: {
                position: 'topleft'
            }
        }).setView([18.4272582, 79.1575702], 5);
        L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
            maxZoom: 18,
            id: 'mapbox.dark',
            accessToken: process.env.MAPBOX_ACCESS_TOKEN
        }).addTo(map);
        return map;
    };
    MapService.prototype.setView = function (map, orgUnit, L) {
        var convertedCoord = GeoJSON_util_1.GeoJSONUtil.convertCoordinates(orgUnit.coordinates, L);
        orgUnit.convertedCoord = convertedCoord;
        if (convertedCoord === null)
            return;
        try {
            map.panTo([convertedCoord.lng, convertedCoord.lat]);
        }
        catch (error) {
            this._logger.log('Error', error);
        }
    };
    MapService.prototype.removeAll = function (controls, map, activeLayerGroups) {
        this._logger.log('Clear map:', map);
        activeLayerGroups.forEach(function (activeLayerGroup, dataset) {
            map.removeLayer(activeLayerGroup);
            controls.removeLayer(activeLayerGroup);
        });
    };
    MapService.prototype.removeDataset = function (controls, map, dataset, activeLayerGroups) {
        var datasetLayerGroupToRemove = activeLayerGroups.get(dataset);
        map.removeLayer(datasetLayerGroupToRemove);
        controls.removeLayer(datasetLayerGroupToRemove);
    };
    /*
     * Loads one layer group to show on map - each layergroup will contain entities, polylines and a org.Unit
     * if it does not exist.
     */
    MapService.prototype.loadLayerGroup = function (dataset, controls, L, map) {
        var _this = this;
        var color = dataset.getColor();
        var layerGroupToMap = L.layerGroup().addTo(map);
        dataset.getTrackedEntityResults().forEach(function (trackedEntities, orgUnit) {
            orgUnit.convertedCoord = GeoJSON_util_1.GeoJSONUtil.convertCoordinates(orgUnit.coordinates, L);
            //Adds all the data to map and returns the overlays to pass to the map control.
            var trackedEntityLayer = _this.getEntities(trackedEntities, dataset.getAddHistoricEnrollments(), L, color);
            var clusterLayer = _this.getCluster(L, color);
            var orgUnitLayer = _this.getOrgUnitLayer(orgUnit, L);
            //The polylines needs to be added last
            var polylineLayer = _this.addDataToMap(layerGroupToMap, orgUnit, clusterLayer, trackedEntityLayer, orgUnitLayer, L, color);
        });
        this.addControlMapOverlay(layerGroupToMap, dataset, controls, color);
        return layerGroupToMap;
    };
    MapService.prototype.addDataToMap = function (layerGroupToMap, selectedOrgUnit, clusterGroup, entityLayer, orgUnitLayer, L, color) {
        clusterGroup.addLayer(entityLayer);
        layerGroupToMap.addLayer(clusterGroup);
        layerGroupToMap.addLayer(orgUnitLayer);
        var polylineLayer = this.getPolylines(entityLayer, clusterGroup, L, color, selectedOrgUnit);
        layerGroupToMap.addLayer(polylineLayer);
        //On zoom - remove poly lines, calculate new ones between facility and either cluster or markers.
        clusterGroup.on('animationend', function (target) {
            var _this = this;
            console.log('Rendering clusters');
            var uniqueEndPoints = new Set();
            for (var key in entityLayer._layers) {
                if (clusterGroup.getVisibleParent(entityLayer._layers[key]) == null)
                    continue;
                var lat = clusterGroup.getVisibleParent(entityLayer._layers[key]).getLatLng().lat;
                var lng = clusterGroup.getVisibleParent(entityLayer._layers[key]).getLatLng().lng;
                uniqueEndPoints.add(GeoJSON_util_1.GeoJSONUtil.convertCoordinates(lng + "," + lat, L));
            }
            if (polylineLayer !== null)
                layerGroupToMap.removeLayer(polylineLayer);
            polylineLayer = L.geoJSON(null, {
                style: {
                    "color": color,
                }
            });
            uniqueEndPoints.forEach(function (endPoint) {
                var geoJSON = GeoJSON_util_1.GeoJSONUtil.exportPolyLineToGeo([endPoint, selectedOrgUnit.convertedCoord]);
                if (geoJSON != null)
                    polylineLayer.addData(geoJSON);
                else
                    _this._logger.log('Not a valid polyline element', endPoint);
            });
            layerGroupToMap.addLayer(polylineLayer); //New calculated polylines
        });
        return polylineLayer;
    };
    //Makes markers based on the entities with a given color and returns them as a layer reference
    MapService.prototype.getEntities = function (trackedEntities, addHistoricEnrollments, L, color) {
        var _this = this;
        var entityIcon = MapObjectFactory_util_1.MapObjectFactory.getMapObject(MapObjectType_enum_1.MapObjectType.ENTITY, color, L).getIcon();
        var entityLayer = L.geoJSON(null, {
            pointToLayer: function (feature, latlng) {
                return L.marker(latlng, { icon: entityIcon });
            }
        }).bindPopup(function (layer) {
            return layer.feature.properties.popupContent;
        });
        trackedEntities.forEach(function (entity) {
            for (var i = 0; i < entity.getEnrollments().length; i++) {
                if (!addHistoricEnrollments && i > 0)
                    continue;
                entity.convertedCoords = GeoJSON_util_1.GeoJSONUtil.convertCoordinates(entity.getCoords(), L);
                var geoJSON = GeoJSON_util_1.GeoJSONUtil.exportPointToGeo(entity.convertedCoords, entity.toString());
                if (geoJSON != null)
                    entityLayer.addData(geoJSON);
                else
                    _this._logger.log('Not a valid entity:', entity);
            }
        });
        return entityLayer;
    };
    MapService.prototype.getCluster = function (L, color) {
        //Making a new clustergroup and adding the newLayer containing all the markers inside.
        var clusterGroup = L.markerClusterGroup({
            chunkedLoading: true,
            showCoverageOnHover: true,
            iconCreateFunction: function (cluster) {
                var clusterSize = "small";
                if (cluster.getChildCount() >= 5000) {
                    clusterSize = "medium";
                }
                else if (cluster.getChildCount() >= 10000) {
                    clusterSize = "large";
                }
                var childMarkers = cluster.getAllChildMarkers();
                childMarkers.forEach(function (marker) {
                    marker.bindPopup(marker.feature.properties.popupContent);
                });
                return new L.DivIcon({
                    html: '<div><span>' + cluster.getChildCount() + '</span></div>',
                    className: 'marker-cluster marker-cluster-' + clusterSize + '-' + color.toLowerCase(),
                    iconSize: new L.Point(40, 40)
                });
            }
        });
        return clusterGroup;
    };
    MapService.prototype.getOrgUnitLayer = function (orgUnit, L) {
        var facilityIcon = MapObjectFactory_util_1.MapObjectFactory.getMapObject(MapObjectType_enum_1.MapObjectType.FACILITY, null, L).getIcon();
        var orgUnitLayer = L.geoJSON(null, {
            pointToLayer: function (feature, latlng) {
                return L.marker(latlng, { icon: facilityIcon });
            }
        }).bindPopup(function (layer) {
            return layer.feature.properties.popupContent;
        });
        var geoJSON = GeoJSON_util_1.GeoJSONUtil.exportPointToGeo(orgUnit.convertedCoord, orgUnit.displayName);
        if (geoJSON != null)
            orgUnitLayer.addData(geoJSON);
        else
            this._logger.log('Not a valid org unit', orgUnit);
        return orgUnitLayer;
    };
    MapService.prototype.getPolylines = function (entityLayer, clusterGroup, L, color, selectedOrgUnit) {
        var _this = this;
        var uniqueEndPoints = new Set();
        for (var key in entityLayer._layers) {
            if (clusterGroup.getVisibleParent(entityLayer._layers[key]) == null)
                continue;
            var lat = clusterGroup.getVisibleParent(entityLayer._layers[key]).getLatLng().lat;
            var lng = clusterGroup.getVisibleParent(entityLayer._layers[key]).getLatLng().lng;
            uniqueEndPoints.add(GeoJSON_util_1.GeoJSONUtil.convertCoordinates(lng + "," + lat, L));
        }
        var polyLineLayer = L.geoJSON(null, {
            style: {
                "color": color,
            }
        });
        uniqueEndPoints.forEach(function (endPoint) {
            var geoJSON = GeoJSON_util_1.GeoJSONUtil.exportPolyLineToGeo([endPoint, selectedOrgUnit.convertedCoord]);
            if (geoJSON != null)
                polyLineLayer.addData(geoJSON);
            else
                _this._logger.log('Not a valid polyline element', endPoint);
        });
        this._logger.log('Returning:', polyLineLayer);
        return polyLineLayer;
    };
    MapService.prototype.addControlMapOverlay = function (layerGroup, dataset, controls, color) {
        var title = "Dataset: " + dataset.getDatasetId() + "<div style=\'border: 1px solid black; background-color:" + color + ";width:10px;height:10px\'></div>";
        controls.addOverlay(layerGroup, title);
    };
    return MapService;
}());
MapService = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [core_2.Logger])
], MapService);
exports.MapService = MapService;
//# sourceMappingURL=map.service.js.map