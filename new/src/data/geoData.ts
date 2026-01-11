// src/data/geoData.ts
import { type Country } from "../types/geo";

export const geoData: Country[] = [
  {
    id: "us",
    name: "United States",
    regions: [
      {
        id: "ca",
        name: "California",
        places: [
          { id: "sf", name: "San Francisco" },
          { id: "la", name: "Los Angeles" },
          { id: "sd", name: "San Diego" },
          { id: "sac", name: "Sacramento" },
        ],
      },
      {
        id: "ny",
        name: "New York",
        places: [
          { id: "nyc", name: "New York City" },
          { id: "buf", name: "Buffalo" },
          { id: "alb", name: "Albany" },
        ],
      },
      {
        id: "tx",
        name: "Texas",
        places: [
          { id: "aus", name: "Austin" },
          { id: "hou", name: "Houston" },
          { id: "dal", name: "Dallas" },
        ],
      },
      {
        id: "wa",
        name: "Washington",
        places: [
          { id: "sea", name: "Seattle" },
          { id: "spk", name: "Spokane" },
          { id: "tac", name: "Tacoma" },
        ],
      },
    ],
  },
  {
    id: "ca",
    name: "Canada",
    regions: [
      {
        id: "on",
        name: "Ontario",
        places: [
          { id: "tor", name: "Toronto" },
          { id: "ott", name: "Ottawa" },
        ],
      },
      {
        id: "bc",
        name: "British Columbia",
        places: [
          { id: "van", name: "Vancouver" },
          { id: "vic", name: "Victoria" },
        ],
      },
    ],
  },
  {
    id: "uk",
    name: "United Kingdom",
    regions: [
      {
        id: "eng",
        name: "England",
        places: [
          { id: "lon", name: "London" },
          { id: "man", name: "Manchester" },
        ],
      },
    ],
  },
  {
    id: "de",
    name: "Germany",
    regions: [
      {
        id: "by",
        name: "Bavaria",
        places: [
          { id: "mun", name: "Munich" },
          { id: "nur", name: "Nuremberg" },
        ],
      },
      {
        id: "be",
        name: "Berlin",
        places: [
          { id: "ber", name: "Berlin" },
          { id: "pot", name: "Potsdam" },
        ],
      },
    ],
  },
  {
    id: "in",
    name: "India",
    regions: [
      {
        id: "ka",
        name: "Karnataka",
        places: [
          { id: "blr", name: "Bangalore" },
          { id: "mys", name: "Mysore" },
        ],
      },
      {
        id: "kl",
        name: "Kerala",
        places: [
          { id: "way", name: "Wayanad" },
          { id: "koc", name: "Kochi" },
          { id: "tvm", name: "Thiruvananthapuram" },
        ],
      },
      {
        id: "mh",
        name: "Maharashtra",
        places: [
          { id: "mum", name: "Mumbai" },
          { id: "pun", name: "Pune" },
        ],
      },
      {
        id: "dl",
        name: "Delhi",
        places: [
          { id: "ndl", name: "New Delhi" },
          { id: "odl", name: "Old Delhi" },
        ],
      },
      {
        id: "tn",
        name: "Tamil Nadu",
        places: [
          { id: "chn", name: "Chennai" },
          { id: "cbe", name: "Coimbatore" },
        ],
      },
    ],
  },
];
