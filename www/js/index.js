/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/
var app = {
  // Application Constructor
  initialize: function() {
    document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
  },

  // deviceready Event Handler
  //
  // Bind any cordova events here. Common events are:
  // 'pause', 'resume', etc.
  onDeviceReady: function() {
    self = this;
    self.resultats = "";
    document.addEventListener('submit', this.validate.bind('this'), false);
    this.injectHTML();
  },

  validate: function(e){
    e.preventDefault();

    //reset du style
    $("input.error").each(function(key, value){
      $(this).removeClass('error');
    });
    //Reset des errors
    $("span.error").each(function(key, value){
      $(this).text('');
    });


    var lieu = $('input[name=lieu]');
    var personnes = $('input[name=personnes]');
    var depart = $('input[name=depart]');
    var retour = $('input[name=retour]');
    var erreur = false;

    if(!lieu.val()){
      //On affiche le message d'erreur
      lieu.addClass('error');
      $('#erreur_lieu').text('Vous devez renseigner un lieu !');
      erreur = true;
    }
    if(!personnes.val()){
      personnes.addClass('error');
      //On affiche le message d'erreur
      $('#erreur_personnes').text('Le nombre de personne doit être indiqué');
      erreur = true;
    }
    if(personnes.val() < 1){
      personnes.addClass('error');
      //On affiche le message d'erreur
      $('#erreur_personnes').text('Le nombre de personne doit être supérieur à 1');
      erreur = true;
    }
    if(!depart.val()){
      depart.addClass('error');
      //On affiche le message d'erreur
      $('#erreur_depart').text('La date de départ doit être renseignée');
      erreur = true;
    }
    if(!retour.val()){
      retour.addClass('error');
      //On affiche le message d'erreur
      $('#erreur_retour').text('La date de retour doit être renseignée');
      erreur = true;
    }
    if(retour.val() && depart.val()){
      // Comparaison des dates
      var dateJour = new Date();

      var dateDepart = new Date(depart.val().split('-')[1] + "-" + depart.val().split('-')[2] + "-" + depart.val().split('-')[0]);
      var dateRetour = new Date(retour.val().split('-')[1] + "-" + retour.val().split('-')[2] + "-" + retour.val().split('-')[0]);

      if(dateRetour <= dateDepart){
        retour.addClass('error');
        //On affiche le message d'erreur
        $('#erreur_retour').text('La date de retour doit être supérieure à la date de départ');
        erreur = true;
      }
      if(dateDepart < dateJour){
        retour.addClass('error');
        //On affiche le message d'erreur
        $('#erreur_depart').text('La date de départ doit être supérieur à la date du jour');
        erreur = true;
      }
    }
    if(erreur == false){
      $('#loader').addClass('active');
      self.searchAirBnb(lieu.val(), personnes.val(), dateDepart.toISOString().split('T')[0], dateRetour.toISOString().split('T')[0]);
    }
  },

  searchAirBnb: function(lieu, personnes, depart, retour){
    $('#resultats').empty();
    var url = "https://www.airbnb.fr/search/search_results/?location="+lieu+"&guests="+personnes+"&checkin="+depart+"&checkout="+retour;
    $.get( url, function(data) {
      self.resultats = data.results_json.search_results;
      $.each(self.resultats, function(key, result){
        var template = `
        <div class="row">
          <div class="col s12">
            <div class="card">
              <div class="card-image">
                <img src="`+result.listing.picture_url+`">
                <span class="card-title">`+result.listing.name+`</span>
              </div>
              <div class="card-content">
                <p>`+result.pricing_quote.rate.amount+` € par nuit, <i class="fa fa-map-marker"></i>
                `+result.listing.localized_city+`<br/>
                `+result.listing.beds+` <i class="fa fa-bed"></i>
                `+result.listing.person_capacity+` <i class="fa fa-users"></i><br/>
                </p>
              </div>
              <div class="card-action">
                <a class="detail" data-id="`+result.listing.id+`">Voir plus</a>
              </div>
            </div>
          </div>
        </div>
        `;
        $('#resultats').append(template);
      });
    })
    .done(function() {
      $('.detail').on('click', self.showDetails);
      $('#formulaire_recherche').hide();
      $('#loader').removeClass('active');
      $('#resultats').show();
      $('#back').show();
      $('#back').on('click', self.backToSearch);
    });
  },

  showDetails: function(){
    $('#loader').addClass('active');
    $('#details').empty();
    $('#back').show();
    self.id = $(this).data('id');
    $.each(self.resultats, function(key, result){
      if(self.id == result.listing.id){
        var template = `
        <div class="row">
          <div class="col s12">
              <div class="card-image">
                <img src="`+result.listing.picture_url+`">
                <span class="card-title">`+result.listing.name+`</span>
              </div>
              <div class="card-content">
                <p>`+result.pricing_quote.rate.amount+` € par nuit, <i class="fa fa-map-marker"></i>
                `+result.listing.localized_city+`<br/>
                `+result.listing.beds+` <i class="fa fa-bed"></i>
                `+result.listing.person_capacity+` <i class="fa fa-users"></i><br/>
                Dates de réservations : <br/>
                Du `+result.pricing_quote.check_in+` au `+result.pricing_quote.check_out+`
                </p>
              </div>
              <div class="card-action">
                <a class="waves-effect waves-light btn">Ajouter à l'agenda</a>
                <a class="waves-effect waves-light btn">Ajouter au panier</a>
              </div>
            </div>
          </div>
        </div>
        `;
        $('#details').append(template);
      }
    });
    $('#details').show();
    $('#resultats').hide();
    $('#back').on('click', self.backTolist);
    $('#loader').removeClass('active');
  },

  backToSearch: function(){
    $('#formulaire_recherche').show();
    $('#resultats').hide();
    $('#back').hide();
  },

  backTolist: function(){
    $('#details').hide();
    $('#resultats').show();
    $('#formulaire_recherche').hide();
    $('#back').on('click', self.backToSearch);
    $('#back').show();
  },

  injectHTML: function(){
    var elements = document.getElementsByTagName('inject');

    for (i in elements) {
      if (elements[i].hasAttribute && elements[i].hasAttribute('data-include')) {
        fragment(elements[i], elements[i].getAttribute('data-include'));
      }
    }
    function fragment(el, url) {
      var localTest = /^(?:file):/,
      xmlhttp = new XMLHttpRequest(),
      status = 0;

      xmlhttp.onreadystatechange = function() {
        /* if we are on a local protocol, and we have response text, we'll assume
        *  				things were sucessful */
        if (xmlhttp.readyState == 4) {
          status = xmlhttp.status;
        }
        if (localTest.test(location.href) && xmlhttp.responseText) {
          status = 200;
        }
        if (xmlhttp.readyState == 4 && status == 200) {
          el.outerHTML = xmlhttp.responseText;
        }
      }

      try {
        xmlhttp.open("GET", url, true);
        xmlhttp.send();
      } catch(err) {
        /* todo catch error */
      }
    }
  }
};

app.initialize();
