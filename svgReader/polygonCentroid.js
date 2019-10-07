/*
MIT License

Copyright (c) 2018 Harry Stevens

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
define([], function () {
    // based on: https://github.com/HarryStevens/geometric/blob/master/src/polygons/polygonCentroid.js
    // Calculates the weighted centroid a polygon.
    function polygonCentroid(vertices){
        var a = 0, x = 0, y = 0, l = vertices.length;
        
        for (let i = 0; i < l; i++) {
            var s = i === l - 1 ? 0 : i + 1,
                v0 = vertices[i],
                v1 = vertices[s],
                f = (v0[0] * v1[1]) - (v1[0] * v0[1]);

            a += f;
            x += (v0[0] + v1[0]) * f;
            y += (v0[1] + v1[1]) * f;
        }
        
        var d = a * 3;                          
        return [x / d, y / d];
    }

    return {
        polygonCentroid: polygonCentroid
    }
});